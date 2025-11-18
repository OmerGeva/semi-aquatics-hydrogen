import type {ComponentProps} from 'react';
import {Link as RouterLink} from 'react-router-dom';

type RouterLinkProps = ComponentProps<typeof RouterLink>;

type NextLinkProps = Omit<RouterLinkProps, 'to'> & {
  href: string;
};

export default function NextLink({href, ...rest}: NextLinkProps) {
  return <RouterLink to={href} {...rest} />;
}
