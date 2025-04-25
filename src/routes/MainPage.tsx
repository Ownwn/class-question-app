import {useEffect, useState} from "react";

export function MainPage() {
    // @ts-ignore
    const [questions, setQuestions] = useState<string[]>([]);
    const [errors, setErrors] = useState<[number, string][]>([]);

    useEffect(() => {
        updateQuestions();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setErrors(array => (
                array.filter(error => Date.now() - error[0] < 3500)
            ));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <>


            <form onSubmit={e => submitQuestion(e)}>
                <input type="text" name="text" placeholder="Question" required/>
                <button type="submit">Add question</button>

            </form>


            {getErrors()}
            <br/>

            <div className="questions">
                {formatQuestions()}
            </div>
        </>
    );

    function getErrors() {
        if (errors.length === 0) {
            return <></>;
        }
        return <>
            {errors.map(e =>
                <h2 key={e[0]} className="error">{e[1]}</h2>)}
        </>;
    }

    function formatQuestions() {
        return <ul>
            {questions.map((e, index) => <li key={index}>{e}</li>)}
        </ul>;
    }

    function updateQuestions() {
        fetch("data/get")
            .then(response => {

                if (checkRedirectUser(response)) {
                    return;
                }

                if (response.ok) {
                    return response.json();
                }
                addError("Error fetching questions");
                throw new Error("Error fetching questions");
            })
            .then(result => {
                // @ts-ignore
                setQuestions(result.map(q => q.value));
            })
            .catch(() => {
                addError("Error loading questions");
                throw new Error("Error loading questions");
            });
    }

    function addError(error: string) {
        if (!error) {
            clearErrors();
            return;
        }
        setErrors([...errors, [Date.now(), error]]);
    }

    function clearErrors() {
        setErrors([]);
    }

    // @ts-ignore
    async function submitQuestion(event) {
        event.preventDefault();
        const text = new FormData(event.target).get("text") as string;
        if (!text) {
            addError("Invalid question");
            return;
        }

        const response = await fetch("data/add", {
            method: "POST",
            body: JSON.stringify({ question: text })
        });

        if (checkRedirectUser(response)) {
            return;
        }

        if (!response.ok) {
            const responseText = await response.text();
            addError("Error adding question: " + (responseText || response.statusText));
            return;
        }
        clearErrors();

        updateQuestions();
    }

    function checkRedirectUser(response: Response) {
        if (response.url.includes("/offline")) {
            window.location.href = "/offline";
            return true;
        }
        return false;
    }
}