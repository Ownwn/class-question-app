export async function onRequest(context) {
    const url = validateUrl(context.request.url);
    if (!url) {
        return response("Bad request", 400);
    }
    if (!checkCookie(context)) {
        return response("Unauthorized", 401);
    }

    const data = await getDataFromId(context.env, url);
    if (!data) {
        return response("Bad data", 500);
    }

    return response(JSON.stringify(data), 200);
}

function response(content: string, status: number) {
    return new Response(content, {
        status: status
    });
}

async function createData(env) {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS employees (id INT PRIMARY KEY, name VARCHAR(50), department VARCHAR(50))").run();

    await env.DB.prepare("INSERT INTO employees VALUES (1, 'John Smith', 'Marketing')").run();

}

async function getDataFromId(env, id: string) {
    try {
        const stmt = env.DB
            .prepare("SELECT * FROM employees WHERE id = ?")
            .bind(id)
            .run();

        const { results } = await stmt;
        return results;
    } catch (e) {
        await createData(env);
        return undefined;
    }
}

function validateUrl(url: string) {
    const badChars = [" ", ";", "&", "*"];
    const urls = ["https://purple-brook-3fec.ownwn.workers.dev/data", "http://127.0.0.1:8788/data"];

    for (const urlStart of urls) {
        if (url.startsWith(urlStart)) {
            url = url.replace(urlStart, "");
            break;
        }
    }
    if (url.startsWith("/")) {
        url = url.substring(1, url.length);
    }
    if (url.endsWith("/")) {
        url = url.substring(0, url.length - 1);
    }


    if (!url || url.length === 0 || badChars.some(char => url.indexOf(char) !== -1)) {
        return undefined;
    }
    return url;
}


function checkCookie(context: EventContext<any, any, any>): boolean {
    const cookies = context.request.headers.get("cookie");
    if (!cookies) {
        return false;
    }

    for (const cookie of cookies.split(";")) {
        const [name, value] = cookie.trim().split("=");
        if (name === "authentication" && value === context.env.AUTH) {
            return true;
        }
    }

    return false;
}