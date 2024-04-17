import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const sendId = params.id;

  if (!/^\d+$/.test(sendId)) {
    error(400, "Invalid ID (must be a number)");
  }
};
