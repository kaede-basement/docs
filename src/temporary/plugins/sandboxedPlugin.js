async function initialize() {
  const console = { log: GrantedScopes.log.info };

  if (EventListeners !== undefined) {
    Object.defineProperty(EventListeners, "routing", {
      set(value) {
        console.log(
          "User has changed the route. New value: " + value,
          "\n" + JSON.stringify(globalThis, null, 2),
          "\n" + JSON.stringify(window, null, 2),
          "\n" + JSON.stringify(self, null, 2),
          "\n" + JSON.stringify(this, null, 2),
        );
      }
    });
    console.log("yaay");
  } else {
    console.log("uheee...");
  }

  await requestPermissions(["write-to-log-file", "internet"]);

  try {
    GrantedScopes.log.info(Object.getOwnPropertyNames(globalThis));
  } catch (error) {
    // No granted permissions
  }

  GrantedScopes.log.info("Hii :3");

  await GrantedScopes.tauriFetch("https://jsonplaceholder.org/posts");
}

initialize();