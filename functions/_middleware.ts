import {gameIsRunning, isAdminValid, isUserValid, validateUrl} from "./_Utils";

export async function onRequest(context: EventContext<any, any, any>) {
    const url = validateUrl(context.request.url);

    if (url === undefined || url === null) {
        return new Response("Bad request URL", {
            status: 400
        });
    }
    if ((url === "" || url.startsWith("data"))) {

        if (!await gameIsRunning(context)) {
            return new Response("Game is offline!", {
                status: 302,
                headers: {
                    "Location": "/offline"
                }
            });
        }

        if (!await isUserValid(context)) {
            return new Response("Please login", {
                status: 302,
                headers: {
                    "Location": "/login"
                }
            });
        }
    }

    if (url === "admin" && !await isAdminValid(context)) {
        return new Response("Please login", {
            status: 302,
            headers: {
                "Location": "/login"
            }
        });
    }

    return await context.next();
}


