async function loadApp() {
    const { app } = await import("./index.js");
}

loadApp();