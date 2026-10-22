(() => {
  const { metro, patcher } = vendetta;

  const KEYWORDS = [
    "초대",
    "초대하기",
    "멤버 초대",
    "친구 초대",
    "서버에 초대하기",
    "서버로 초대하기",
    "invite",
    "invite members",
    "invite friends",
    "invite to server",
  ].map((k) => k.toLowerCase());

  const DEBUG = true;

  const LABEL_PROPS = ["label", "text", "title", "accessibilityLabel"];

  function shouldHide(props) {
    if (!props || typeof props !== "object") return false;
    for (const key of LABEL_PROPS) {
      const value = props[key];
      if (typeof value !== "string") continue;
      const normalized = value.trim().toLowerCase();
      if (DEBUG && /초대|invite/.test(normalized)) {
        console.log(`[HideInvite] ${key}: "${value}"`);
      }
      if (KEYWORDS.includes(normalized)) return true;
    }
    return false;
  }

  const unpatches = [];

  return {
    onLoad() {
      const runtime = metro.findByProps("jsx", "jsxs");
      if (runtime) {
        for (const fn of ["jsx", "jsxs"]) {
          unpatches.push(
            patcher.instead(fn, runtime, (args, orig) =>
              shouldHide(args[1]) ? orig(runtime.Fragment, {}) : orig(...args)
            )
          );
        }
      }

      const React = metro.common?.React ?? metro.findByProps("createElement", "useState");
      if (React) {
        unpatches.push(
          patcher.instead("createElement", React, (args, orig) =>
            shouldHide(args[1]) ? orig(React.Fragment, null) : orig(...args)
          )
        );
      }
    },

    onUnload() {
      for (const unpatch of unpatches) unpatch();
      unpatches.length = 0;
    },
  };
})()
