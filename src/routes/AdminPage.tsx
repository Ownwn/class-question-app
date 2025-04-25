import {useFormStatus} from "react-dom";
import {useEffect, useState} from "react";

export function AdminPage() {
    const [response, setResponse] = useState("Waiting for input...");
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        updateIsRunning();
    }, []);

    async function updateIsRunning() {
        const status = await fetch("gameStatus");
        setIsRunning(await status.text() === "true");
    }


    function StartForm() {
        const status = useFormStatus();
        return (
            <>
                <button type="submit" name="start" value="true">Start Game</button>
                <button type="submit" name="stop" value="true">Stop game</button>
                <p>{status.pending ? "Loading.." : response}</p>
            </>
        );
    }

    async function requestGameStart(formData: any) {
        setResponse("Loading...");


        const res = await fetch("requestNewGame", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (!res.ok) {
            setResponse("Error starting game - res is not ok - " + res.status);
            return;
        }
        setResponse("Success! Game " + await res.text());
        await updateIsRunning();

    }

    return <>
        <p>admin page</p>

        <h2>Game is {isRunning ? "running" : "offline"}</h2>

        <form action={requestGameStart}>
            <StartForm/>
        </form>
    </>;
}