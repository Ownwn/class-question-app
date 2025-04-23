const urls = ["https://class-question-app.pages.dev", "http://127.0.0.1:5173"];


export async function onRequest(context: EventContext<any, any, any>) {
    const url = validateUrl(context.request.url);

    if (url === undefined || url === null) {
        return new Response("Bad request URL", {
            status: 400
        });
    }

    if ((url === "" || url.startsWith("data")) && !await isUserValid(context)) {
        return new Response("Please login", {
            status: 302,
            headers: {
                "Location": "/login"
            }
        });
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


function validateUrl(url: string) {
    if (!url) {
        return undefined;
    }

    for (const validUrl of urls) {
        if (url.startsWith(validUrl)) {
            url = url.replace(validUrl, "");
            break;
        }
    }

    if (url.endsWith("/")) {
        url = url.substring(0, url.length - 1);
    }
    if (url.startsWith("/")) {
        url = url.substring(1, url.length);
    }

    if (url !== null && url !== undefined) {
        return url;
    }
    return undefined;
}

async function isUserValid(context) {
    return checkAuth(context, "user_authentication", true, await context.env.USER_AUTH);
}

async function isAdminValid(context) {
    return checkAuth(context, "admin_authentication", false, await context.env.ADMIN_AUTH);
}

function checkAuth(context: EventContext<any, any, any>, cookieName: string, needsUser: boolean, expectedAuth: string) {
    const cookies = context.request.headers.get("cookie");
    if (!cookies) {
        return false;
    }

    let authFound = false;
    let hasUserName = false;

    for (const cookie of cookies.split(";")) {
        const [name, value] = cookie.trim().split("=");
        if (name === cookieName && value === expectedAuth) {
            authFound = true;
        } else if (name === "user_id" && value) {
            hasUserName = true;
        }
    }
    return needsUser ? authFound && hasUserName : authFound;
}