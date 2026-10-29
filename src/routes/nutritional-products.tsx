import { createFileRoute, redirect } from "@tanstack/react-router";

// Old URL kept working — categories now live at /category/$slug and are managed from the admin panel.
export const Route = createFileRoute("/nutritional-products")({
  beforeLoad: () => {
    throw redirect({ to: "/category/$slug", params: { slug: "nutritional-products" } });
  },
});
