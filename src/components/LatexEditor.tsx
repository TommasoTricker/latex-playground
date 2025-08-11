"use client"

import Editor from "@monaco-editor/react"
import { useCallback } from "react"

export default function LatexEditor({ value, onChange }: {
    value: string
    onChange: (value: string | undefined) => void
}) {
    const handleBeforeMount = useCallback((monaco: typeof import("monaco-editor")) => {
        if (!monaco.languages.getLanguages().some(l => l.id === "latex")) {
            monaco.languages.register({ id: "latex" })
            monaco.languages.setMonarchTokensProvider("latex", {
                tokenizer: {
                    root: [
                        [/\\[a-zA-Z]+/, "keyword"],
                        [/\\./, "keyword"],
                        [/%.*$/, "comment"],
                        [/\$[^$]*\$/, "string"],
                        [/[^\\%$]+/, ""]
                    ]
                }
            })
        }
    }, [])

    return (
        <Editor
            defaultLanguage="latex"
            value={value}
            onChange={onChange}
            beforeMount={handleBeforeMount}
            theme="vs-dark"
            options={{
                fontSize: 14
            }}
        />
    )
}
