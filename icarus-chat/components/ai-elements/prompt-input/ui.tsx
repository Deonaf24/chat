"use client";

import {
    Children,
    type ComponentProps,
    type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import {
    InputGroupAddon,
    InputGroupButton,
} from "@/components/ui/input-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { PlusIcon, SendIcon, Loader2Icon, SquareIcon, XIcon } from "lucide-react";
import type { ChatStatus } from "ai";

export type PromptInputHeaderProps = Omit<
    ComponentProps<typeof InputGroupAddon>,
    "align"
>;

export const PromptInputHeader = ({
    className,
    ...props
}: PromptInputHeaderProps) => (
    <InputGroupAddon
        align="block-end"
        className={cn("order-first flex-wrap gap-1", className)}
        {...props}
    />
);

export type PromptInputFooterProps = Omit<
    ComponentProps<typeof InputGroupAddon>,
    "align"
>;

export const PromptInputFooter = ({
    className,
    ...props
}: PromptInputFooterProps) => (
    <InputGroupAddon
        align="block-end"
        className={cn("justify-between gap-1", className)}
        {...props}
    />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
    className,
    ...props
}: PromptInputToolsProps) => (
    <div className={cn("flex items-center gap-1", className)} {...props} />
);

export type PromptInputButtonProps = ComponentProps<typeof InputGroupButton>;

export const PromptInputButton = ({
    variant = "ghost",
    className,
    size,
    ...props
}: PromptInputButtonProps) => {
    const newSize =
        size ?? (Children.count(props.children) > 1 ? "sm" : "icon-sm");

    return (
        <InputGroupButton
            className={cn(className)}
            size={newSize}
            type="button"
            variant={variant}
            {...props}
        />
    );
};

export type PromptInputActionMenuProps = ComponentProps<typeof DropdownMenu>;
export const PromptInputActionMenu = (props: PromptInputActionMenuProps) => (
    <DropdownMenu {...props} />
);

export type PromptInputActionMenuTriggerProps = PromptInputButtonProps;

export const PromptInputActionMenuTrigger = ({
    className,
    children,
    ...props
}: PromptInputActionMenuTriggerProps) => (
    <DropdownMenuTrigger asChild>
        <PromptInputButton className={className} {...props}>
            {children ?? <PlusIcon className="size-4" />}
        </PromptInputButton>
    </DropdownMenuTrigger>
);

export type PromptInputActionMenuContentProps = ComponentProps<
    typeof DropdownMenuContent
>;
export const PromptInputActionMenuContent = ({
    className,
    ...props
}: PromptInputActionMenuContentProps) => (
    <DropdownMenuContent align="start" className={cn(className)} {...props} />
);

export type PromptInputActionMenuItemProps = ComponentProps<
    typeof DropdownMenuItem
>;
export const PromptInputActionMenuItem = ({
    className,
    ...props
}: PromptInputActionMenuItemProps) => (
    <DropdownMenuItem className={cn(className)} {...props} />
);

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
    status?: ChatStatus;
};

export const PromptInputSubmit = ({
    className,
    variant = "default",
    size = "icon-sm",
    status,
    children,
    ...props
}: PromptInputSubmitProps) => {
    let Icon = <SendIcon className="size-4" />;

    if (status === "submitted") {
        Icon = <Loader2Icon className="size-4 animate-spin" />;
    } else if (status === "streaming") {
        Icon = <SquareIcon className="size-4" />;
    } else if (status === "error") {
        Icon = <XIcon className="size-4" />;
    }

    return (
        <InputGroupButton
            aria-label="Submit"
            className={cn(className)}
            size={size}
            type="submit"
            variant={variant}
            {...props}
        >
            {children ?? Icon}
        </InputGroupButton>
    );
};

// ... HoverCard, Select, Tabs, Command wrappers ...

// HoverCard
export type PromptInputHoverCardProps = ComponentProps<typeof HoverCard>;
export const PromptInputHoverCard = ({
    openDelay = 0,
    closeDelay = 0,
    ...props
}: PromptInputHoverCardProps) => (
    <HoverCard closeDelay={closeDelay} openDelay={openDelay} {...props} />
);

export type PromptInputHoverCardTriggerProps = ComponentProps<
    typeof HoverCardTrigger
>;
export const PromptInputHoverCardTrigger = (
    props: PromptInputHoverCardTriggerProps
) => <HoverCardTrigger {...props} />;

export type PromptInputHoverCardContentProps = ComponentProps<
    typeof HoverCardContent
>;
export const PromptInputHoverCardContent = ({
    align = "start",
    ...props
}: PromptInputHoverCardContentProps) => (
    <HoverCardContent align={align} {...props} />
);

// Select (Model Select)
export type PromptInputModelSelectProps = ComponentProps<typeof Select>;
export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => (
    <Select {...props} />
);

export type PromptInputModelSelectTriggerProps = ComponentProps<
    typeof SelectTrigger
>;
export const PromptInputModelSelectTrigger = ({
    className,
    ...props
}: PromptInputModelSelectTriggerProps) => (
    <SelectTrigger
        className={cn(
            "border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors",
            'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
            className
        )}
        {...props}
    />
);

export type PromptInputModelSelectContentProps = ComponentProps<
    typeof SelectContent
>;
export const PromptInputModelSelectContent = ({
    className,
    ...props
}: PromptInputModelSelectContentProps) => (
    <SelectContent className={cn(className)} {...props} />
);

export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>;
export const PromptInputModelSelectItem = ({
    className,
    ...props
}: PromptInputModelSelectItemProps) => (
    <SelectItem className={cn(className)} {...props} />
);

export type PromptInputModelSelectValueProps = ComponentProps<
    typeof SelectValue
>;
export const PromptInputModelSelectValue = ({
    className,
    ...props
}: PromptInputModelSelectValueProps) => (
    <SelectValue className={cn(className)} {...props} />
);


// Tabs
export type PromptInputTabsListProps = HTMLAttributes<HTMLDivElement>;
export const PromptInputTabsList = ({
    className,
    ...props
}: PromptInputTabsListProps) => <div className={cn(className)} {...props} />;

export type PromptInputTabProps = HTMLAttributes<HTMLDivElement>;
export const PromptInputTab = ({
    className,
    ...props
}: PromptInputTabProps) => <div className={cn(className)} {...props} />;

export type PromptInputTabLabelProps = HTMLAttributes<HTMLHeadingElement>;
export const PromptInputTabLabel = ({
    className,
    ...props
}: PromptInputTabLabelProps) => (
    <h3
        className={cn(
            "mb-2 px-3 font-medium text-muted-foreground text-xs",
            className
        )}
        {...props}
    />
);

export type PromptInputTabBodyProps = HTMLAttributes<HTMLDivElement>;
export const PromptInputTabBody = ({
    className,
    ...props
}: PromptInputTabBodyProps) => (
    <div className={cn("space-y-1", className)} {...props} />
);

export type PromptInputTabItemProps = HTMLAttributes<HTMLDivElement>;
export const PromptInputTabItem = ({
    className,
    ...props
}: PromptInputTabItemProps) => (
    <div
        className={cn(
            "flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent",
            className
        )}
        {...props}
    />
);

// Command
export type PromptInputCommandProps = ComponentProps<typeof Command>;
export const PromptInputCommand = ({
    className,
    ...props
}: PromptInputCommandProps) => <Command className={cn(className)} {...props} />;

export type PromptInputCommandInputProps = ComponentProps<typeof CommandInput>;
export const PromptInputCommandInput = ({
    className,
    ...props
}: PromptInputCommandInputProps) => (
    <CommandInput className={cn(className)} {...props} />
);

export type PromptInputCommandListProps = ComponentProps<typeof CommandList>;
export const PromptInputCommandList = ({
    className,
    ...props
}: PromptInputCommandListProps) => (
    <CommandList className={cn(className)} {...props} />
);

export type PromptInputCommandEmptyProps = ComponentProps<typeof CommandEmpty>;
export const PromptInputCommandEmpty = ({
    className,
    ...props
}: PromptInputCommandEmptyProps) => (
    <CommandEmpty className={cn(className)} {...props} />
);

export type PromptInputCommandGroupProps = ComponentProps<typeof CommandGroup>;
export const PromptInputCommandGroup = ({
    className,
    ...props
}: PromptInputCommandGroupProps) => (
    <CommandGroup className={cn(className)} {...props} />
);

export type PromptInputCommandItemProps = ComponentProps<typeof CommandItem>;
export const PromptInputCommandItem = ({
    className,
    ...props
}: PromptInputCommandItemProps) => (
    <CommandItem className={cn(className)} {...props} />
);

export type PromptInputCommandSeparatorProps = ComponentProps<
    typeof CommandSeparator
>;
export const PromptInputCommandSeparator = ({
    className,
    ...props
}: PromptInputCommandSeparatorProps) => (
    <CommandSeparator className={cn(className)} {...props} />
);

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;
export const PromptInputBody = ({
    className,
    ...props
}: PromptInputBodyProps) => (
    <div className={cn("contents", className)} {...props} />
);
