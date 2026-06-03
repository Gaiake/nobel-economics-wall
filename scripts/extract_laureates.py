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

THEORY_TAG_OVERRIDES = {
    "ragnar-frisch-1969-1": "计量经济学",
    "jan-tinbergen-1969-2": "政策模型",
    "paul-a-samuelson-1970-1": "现代经济学",
    "simon-kuznets-1971-1": "国民收入",
    "john-r-hicks-1972-1": "福利经济学",
    "kenneth-j-arrow-1972-2": "社会选择",
    "wassily-leontief-1973-1": "投入产出",
    "gunnar-myrdal-1974-1": "制度分析",
    "friedrich-von-hayek-1974-2": "市场秩序",
    "leonid-kantorovich-1975-1": "资源配置",
    "tjalling-c-koopmans-1975-2": "资源配置",
    "milton-friedman-1976-1": "货币主义",
    "bertil-ohlin-1977-1": "国际贸易",
    "james-e-meade-1977-2": "国际经济",
    "herbert-a-simon-1978-1": "有限理性",
    "william-arthur-lewis-1979-1": "发展经济学",
    "theodore-w-schultz-1979-2": "人力资本",
    "lawrence-r-klein-1980-1": "经济预测",
    "james-tobin-1981-1": "金融宏观",
    "george-j-stigler-1982-1": "产业组织",
    "g-rard-debreu-1983-1": "一般均衡",
    "john-richard-nicholas-stone-1984-1": "国民核算",
    "franco-modigliani-1985-1": "生命周期",
    "james-m-buchanan-jr-1986-1": "公共选择",
    "robert-m-solow-1987-1": "增长理论",
    "maurice-allais-1988-1": "市场效率",
    "trygve-haavelmo-1989-1": "计量基础",
    "harry-m-markowitz-1990-1": "资产组合",
    "william-f-sharpe-1990-2": "资产定价",
    "merton-h-miller-1990-3": "公司金融",
    "ronald-h-coase-1991-1": "交易成本",
    "gary-s-becker-1992-1": "社会经济学",
    "robert-w-fogel-1993-1": "经济史",
    "douglass-c-north-1993-2": "制度变迁",
    "john-f-nash-jr-1994-1": "博弈论",
    "john-c-harsanyi-1994-2": "博弈论",
    "reinhard-selten-1994-3": "博弈论",
    "robert-e-lucas-jr-1995-1": "理性预期",
    "james-a-mirrlees-1996-1": "激励理论",
    "william-s-vickrey-1996-2": "拍卖理论",
    "robert-c-merton-1997-1": "期权定价",
    "myron-s-scholes-1997-2": "期权定价",
    "amartya-sen-1998-1": "福利经济学",
    "robert-a-mundell-1999-1": "货币政策",
    "james-j-heckman-2000-1": "选择模型",
    "daniel-l-mcfadden-2000-2": "离散选择",
    "george-a-akerlof-2001-1": "逆向选择",
    "a-michael-spence-2001-2": "信号理论",
    "joseph-e-stiglitz-2001-3": "信息经济学",
    "daniel-kahneman-2002-1": "行为决策",
    "vernon-l-smith-2002-2": "实验经济学",
    "robert-f-engle-iii-2003-1": "金融波动",
    "clive-w-j-granger-2003-2": "协整理论",
    "finn-e-kydland-2004-1": "时间一致性",
    "edward-c-prescott-2004-2": "真实周期",
    "thomas-c-schelling-2005-1": "冲突合作",
    "robert-j-aumann-2005-2": "重复博弈",
    "edmund-s-phelps-2006-1": "自然失业率",
    "leonid-hurwicz-2007-1": "机制设计",
    "eric-s-maskin-2007-2": "机制设计",
    "roger-b-myerson-2007-3": "机制设计",
    "paul-krugman-2008-1": "新贸易理论",
    "elinor-ostrom-2009-1": "公共治理",
    "oliver-e-williamson-2009-2": "企业边界",
    "peter-a-diamond-2010-1": "搜寻匹配",
    "dale-t-mortensen-2010-2": "搜寻匹配",
    "christopher-a-pissarides-2010-3": "搜寻匹配",
    "thomas-j-sargent-2011-1": "宏观计量",
    "christopher-a-sims-2011-2": "宏观计量",
    "alvin-e-roth-2012-1": "市场设计",
    "lloyd-s-shapley-2012-2": "匹配理论",
    "eugene-f-fama-2013-1": "有效市场",
    "lars-peter-hansen-2013-2": "广义矩估计",
    "robert-j-shiller-2013-3": "行为金融",
    "jean-tirole-2014-1": "产业监管",
    "angus-deaton-2015-1": "消费福利",
    "oliver-hart-2016-1": "契约理论",
    "bengt-holmstr-m-2016-2": "契约理论",
    "richard-h-thaler-2017-1": "行为经济学",
    "william-d-nordhaus-2018-1": "气候经济学",
    "paul-m-romer-2018-2": "内生增长",
    "abhijit-banerjee-2019-1": "减贫实验",
    "esther-duflo-2019-2": "减贫实验",
    "michael-kremer-2019-3": "减贫实验",
    "paul-r-milgrom-2020-1": "拍卖理论",
    "robert-b-wilson-2020-2": "拍卖理论",
    "david-card-2021-1": "因果推断",
    "joshua-d-angrist-2021-2": "因果推断",
    "guido-w-imbens-2021-3": "因果推断",
    "ben-s-bernanke-2022-1": "金融危机",
    "douglas-w-diamond-2022-2": "银行理论",
    "philip-h-dybvig-2022-3": "银行理论",
    "claudia-goldin-2023-1": "性别经济学",
    "daron-acemoglu-2024-1": "制度与繁荣",
    "simon-johnson-2024-2": "制度与繁荣",
    "james-a-robinson-2024-3": "制度与繁荣",
    "philippe-aghion-2025-1": "创造性毁灭",
    "peter-howitt-2025-2": "创造性毁灭",
    "joel-mokyr-2025-3": "技术进步",
}

PORTRAIT_POSITION_OVERRIDES = {
    "ragnar-frisch-1969-1": "78% 50%",
    "george-a-akerlof-2001-1": "50% 24%",
}


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


def theory_tag_for(winner: dict, theory: str) -> str:
    return THEORY_TAG_OVERRIDES.get(winner["id"], short_tag(theory))


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
            theory_tag = theory_tag_for(winner, theory)
            winner["theory"] = theory
            winner["theoryTag"] = theory_tag
            winner["quote"] = quote
            winner["bio"] = f"{winner['nameZh']}因其在{theory_tag}等领域的代表性贡献获得诺贝尔经济学奖。"
            winner["portrait"] = ""
            if winner["id"] in PORTRAIT_POSITION_OVERRIDES:
                winner["portraitPosition"] = PORTRAIT_POSITION_OVERRIDES[winner["id"]]
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
