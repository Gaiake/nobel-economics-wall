from __future__ import annotations

import json
import re
import shutil
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX_PATH = ROOT / "1969-2025年诺贝尔经济学奖得主.docx"
DATA_PATH = ROOT / "src" / "data" / "laureates.json"
PORTRAIT_DIR = ROOT / "assets" / "portraits"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
YEAR_RE = re.compile(r"^(19|20)\d{2}年$")
WINNER_LINE_RE = re.compile(r"^(.+?)（(.+?)，(.+?)）$")


def decade_for_year(year: int) -> str:
    if 1969 <= year <= 1979:
        return "1969-1979"
    return f"{year // 10 * 10}s"


def slugify_name(name_en: str, year: int, index: int) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name_en.lower()).strip("-")
    return f"{base or 'laureate'}-{year}-{index}"


def read_paragraphs() -> list[str]:
    with zipfile.ZipFile(DOCX_PATH) as archive:
        document_xml = archive.read("word/document.xml")

    root = ET.fromstring(document_xml)
    paragraphs = []
    for paragraph in root.findall(".//w:p", NS):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def ordered_media_paths() -> list[str]:
    with zipfile.ZipFile(DOCX_PATH) as archive:
        document_xml = archive.read("word/document.xml")
        rels_xml = archive.read("word/_rels/document.xml.rels")

    rels_root = ET.fromstring(rels_xml)
    relmap = {
        rel.attrib["Id"]: rel.attrib.get("Target", "")
        for rel in rels_root
        if rel.attrib.get("Id")
    }
    document_root = ET.fromstring(document_xml)

    paths = []
    for paragraph in document_root.findall(".//w:p", NS):
        for blip in paragraph.findall(".//a:blip", NS):
            rel_id = blip.attrib.get(f"{{{NS['r']}}}embed")
            target = relmap.get(rel_id, "")
            if target.startswith("media/"):
                paths.append(f"assets/portraits/{Path(target).name.lower()}")
    return paths


def split_sections(paragraphs: list[str]) -> list[tuple[int, list[str]]]:
    sections = []
    current_year = None
    current_lines = []

    for paragraph in paragraphs:
        if YEAR_RE.match(paragraph):
            if current_year is not None:
                sections.append((current_year, current_lines))
            current_year = int(paragraph[:-1])
            current_lines = []
        elif current_year is not None:
            current_lines.append(paragraph)

    if current_year is not None:
        sections.append((current_year, current_lines))

    return sections


def collect_block(lines: list[str], start_label: str, stop_labels: tuple[str, ...]) -> list[str]:
    result = []
    active = False
    for line in lines:
        if line.startswith(start_label):
            active = True
            tail = line.replace(start_label, "", 1).strip()
            if tail:
                result.append(tail)
            continue
        if active and any(line.startswith(label) for label in stop_labels):
            break
        if active:
            result.append(line)
    return [
        item
        for item in result
        if item and item not in {"（找不到）", "找不到", "米德：（找不到）"}
    ]


def parse_winners(year: int, lines: list[str]) -> list[dict]:
    winner_lines = collect_block(lines, "得主：", ("经典理论：", "精彩名言："))
    winners = []
    for index, line in enumerate(winner_lines, start=1):
        match = WINNER_LINE_RE.match(line)
        if match:
            name_zh, name_en, country = match.groups()
        else:
            name_zh, name_en, country = line, "", ""
        winners.append(
            {
                "id": slugify_name(name_en or name_zh, year, index),
                "year": year,
                "decade": decade_for_year(year),
                "nameZh": name_zh.strip(),
                "nameEn": name_en.strip(),
                "country": country.strip(),
            }
        )
    return winners


def name_aliases(name_zh: str) -> set[str]:
    aliases = {name_zh}
    if "·" in name_zh:
        aliases.add(name_zh.split("·")[-1])
    return {alias for alias in aliases if alias}


def parse_named_block(block: list[str], name_zh: str) -> str:
    aliases = name_aliases(name_zh)
    for line in block:
        if "：" in line:
            label, value = line.split("：", 1)
        elif ":" in line:
            label, value = line.split(":", 1)
        else:
            continue
        if any(alias in label or label in alias for alias in aliases):
            return value.strip()

    unnamed_lines = [line for line in block if "：" not in line and ":" not in line]
    if unnamed_lines:
        return " ".join(unnamed_lines).strip()
    return ""


def short_tag(theory: str) -> str:
    if not theory:
        return "经济学贡献"
    text = re.split(r"[，。,；;（(]", theory)[0]
    return text[:8]


def clean_text(text: str) -> str:
    return text.replace("（找不到）", "").replace("找不到", "").strip(" ：:;；")


def build_records() -> list[dict]:
    records = []
    for year, lines in split_sections(read_paragraphs()):
        winners = parse_winners(year, lines)
        theory_block = collect_block(lines, "经典理论：", ("精彩名言：",))
        quote_block = collect_block(lines, "精彩名言：", tuple())

        for winner in winners:
            theory = clean_text(parse_named_block(theory_block, winner["nameZh"]) or " ".join(theory_block))
            quote = clean_text(parse_named_block(quote_block, winner["nameZh"]) or " ".join(quote_block))
            theory_tag = short_tag(theory)
            winner["theory"] = theory
            winner["theoryTag"] = theory_tag
            winner["quote"] = quote
            winner["bio"] = f"{winner['nameZh']}因其在{theory_tag}等领域的代表性贡献获得诺贝尔经济学奖。"
            winner["portrait"] = ""
            records.append(winner)

    media_paths = ordered_media_paths()
    if len(media_paths) == len(records):
        for record, media_path in zip(records, media_paths):
            record["portrait"] = media_path

    return records


def extract_media() -> None:
    PORTRAIT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(DOCX_PATH) as archive:
        for member in archive.namelist():
            if member.startswith("word/media/") and not member.endswith("/"):
                target = PORTRAIT_DIR / Path(member).name.lower()
                with archive.open(member) as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)


def main() -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    extract_media()
    records = build_records()
    DATA_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} records to {DATA_PATH}")


if __name__ == "__main__":
    main()
