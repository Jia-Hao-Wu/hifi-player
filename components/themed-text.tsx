import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  className?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const typeClasses: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-base leading-6',
  defaultSemiBold: 'text-base leading-6 font-semibold',
  title: 'text-[32px] font-bold leading-8',
  subtitle: 'text-xl font-bold',
  link: 'text-base leading-[30px] text-foreground/60 underline',
};

export function ThemedText({ className, type = 'default', ...props }: ThemedTextProps) {
  return (
    <Text
      className={`text-foreground ${typeClasses[type]} ${className ?? ''}`}
      {...props}
    />
  );
}
