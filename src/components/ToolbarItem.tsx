import { HTMLAttributes, ReactNode } from 'react'

export default function ToolbarItem({ children, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
    return <div className="flex gap-2 px-2 py-1 my-2 rounded-lg hover:bg-neutral-800 transition duration-200 select-none cursor-pointer" {...props}>
        {children}
    </div>
}
