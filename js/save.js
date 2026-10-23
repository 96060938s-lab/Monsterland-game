
const MW_SAVE_KEY = "monsterWorldSave";

function mwLoadState() {
  try {
    const savedData = localStorage.getItem(MW_SAVE_KEY);

    if (!savedData) {
      return mwCreateInitialState();
    }

    const parsedData = JSON.parse(savedData);
    return mwNormalizeState(parsedData);
  } catch (error) {
    console.error("Error al cargar MonsterWorld:", error);
    return mwCreateInitialState();
  }
}

function mwSaveState(state) {
  try {
    const normalizedState = mwNormalizeState(state);

    localStorage.setItem(
      MW_SAVE_KEY,
      JSON.stringify(normalizedState)
    );

    return true;
  } catch (error) {
    console.error("Error al guardar MonsterWorld:", error);
    return false;
  }
}
