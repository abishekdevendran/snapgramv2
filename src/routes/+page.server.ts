import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/session";

export const actions: Actions = {
    logout: async (event) => {
        console.log("logout");
        if (event.locals.session === null) {
            return fail(401);
        }
        await invalidateSession(event.locals.session.id);
        deleteSessionTokenCookie(event);
        return redirect(302, "/login");
    }
};