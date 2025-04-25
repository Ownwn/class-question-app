import {isAdminValid} from "./_Utils";

export async function onRequestPost(context: EventContext<any, any, any>) {
    if (!await isAdminValid(context)) {
        return new Response(null, {
            status: 401
        });
    }

    let shouldStart: boolean;
    try {
        const json = await context.request.json();
        if (json.start) {
            shouldStart = true;
        } else if (json.stop) {
            shouldStart = false;
        } else {
            return new Response("Bad start param", {
                status: 400
            });
        }


        if (shouldStart) {
            await setRunning(context, true);
            await clearQuestions(context);
        } else {
            await setRunning(context, false);
        }
        await clearQuestions(context);


    } catch (error) {
        return new Response(null, {
            status: 401
        });
    }

    return new Response(shouldStart ? "Started!" : "Stopped!", {
        status: 200
    });


}

async function clearQuestions(context) {
    await context.env.SURF.prepare("DELETE FROM questions").run();
}

async function setRunning(context, running: boolean) {
    await context.env.RATE_LIMIT.put("running", String(running));
}