(() => {
  if (window.__offlineBridgeInstalled) return;
  window.__offlineBridgeInstalled = true;

  const attached = new WeakSet();

  window.__remoteAttach = function(socket) {
    if (!socket || attached.has(socket)) return;
    attached.add(socket);

    console.log("[offline-test] 本機連線介面已建立");

    setTimeout(() => {
      try {
        socket.connected = true;

        if (typeof socket.fire !== "function") {
          console.error("[offline-test] 找不到 Socket fire 方法");
          return;
        }

        socket.fire("connect");
        console.log("[offline-test] 已觸發 connect 事件");
      } catch (error) {
        console.error("[offline-test] 連線啟動失敗", error);
      }
    }, 0);
  };

  window.__remoteBye = function(socket) {
    if (socket) socket.connected = false;
    console.log("[offline-test] 本機連線介面已結束");
  };

  console.log("[offline-test] 本機連線介面安裝完成");
})();