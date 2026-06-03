export function getDecades(laureates) {
  return [...new Set(laureates.map((item) => item.decade))];
}

export function getLaureatesForDecade(laureates, decade) {
  return laureates.filter((item) => item.decade === decade);
}

export function getInitialSelection(laureates) {
  const [activeDecade] = getDecades(laureates);
  const [firstLaureate] = getLaureatesForDecade(laureates, activeDecade);

  return {
    activeDecade,
    activeLaureateId: firstLaureate?.id ?? "",
  };
}

export function getNextLaureate(laureates, activeLaureateId) {
  if (laureates.length === 0) {
    return null;
  }

  const activeIndex = laureates.findIndex((item) => item.id === activeLaureateId);
  const nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % laureates.length;
  return laureates[nextIndex];
}
