// routes/+page.server.ts
import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    if (event.locals.user) {
        return redirect(302, "/");
    }
    return {
        user: event.locals.user
    };
};