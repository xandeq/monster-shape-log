import { cssInterop } from 'nativewind';
import React, { ComponentType, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';

/**
 * A compatibility shim for NativeWind v4's removal of `styled()`.
 */
export function styled<T extends ComponentType<any>>(
    Component: T,
    baseClassName?: string
): ForwardRefExoticComponent<PropsWithoutRef<React.ComponentProps<T>> & { className?: string } & RefAttributes<any>> {

    try {
        cssInterop(Component, {
            className: {
                target: "style",
            },
        });
    } catch (e) {
        // Ignore errors if component is already registered or if strict mode complains
    }

    return React.forwardRef((props: any, ref) => {
        const { className, ...rest } = props;
        const combinedClassName = [baseClassName, className].filter(Boolean).join(' ');
        return React.createElement(Component as any, {
            ref,
            className: combinedClassName,
            ...rest
        });
    });
}
