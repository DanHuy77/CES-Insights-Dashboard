const createLoader = () => {
  const $container = $("#container");
  const $loader = $("#loader");
  return {
    loading: false,
    show() {
      if (this.loading) return;
      this.loading = true;
      $loader.removeClass("hidden");
      $container.addClass("opacity-10 pointer-events-none");
    },
    hide() {
      if (!this.loading) return;
      this.loading = false;
      $loader.addClass("hidden");
      $container.removeClass("opacity-10 pointer-events-none");
    },
  };
};

export const Loader = createLoader();
