import React, { useEffect } from 'react';
import useIntersectionObserver from '/imports/ui/hooks/useIntersectionObserver';
import SkeletonUserListItem from '../list-item/skeleton/component';
import USERS_PER_USER_LIST_PAGE from '/imports/ui/components/user-list/user-list-participants/constants';

const MOUNT_DELAY = 1000;

const UNMOUNT_DELAY = 20000;

interface IntersectionWatcherProps {
  ParentRef: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  isLastItem: boolean;
  restOfUsers: number;
}

const IntersectionWatcher: React.FC<IntersectionWatcherProps> = ({
  children,
  ParentRef,
  isLastItem,
  restOfUsers,
}) => {
  const childrenRef = React.useRef<HTMLDivElement | null>(null);
  const setTimoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const [renderPage, setRenderPage] = React.useState(false);
  const {
    childRefProxy,
    intersecting,
  } = useIntersectionObserver(ParentRef, childrenRef, 0);

  const handleIntersection = (bool: boolean) => {
    clearTimeout(setTimoutRef.current);
    if (bool) {
      setTimoutRef.current = setTimeout(() => {
        setRenderPage(true);
      }, MOUNT_DELAY);
    } else {
      setTimoutRef.current = setTimeout(() => {
        setRenderPage(false);
      }, UNMOUNT_DELAY);
    }
  };

  useEffect(() => {
    if (intersecting) {
      handleIntersection(true);
    } else {
      handleIntersection(false);
    }
  }, [intersecting]);

  if (renderPage) {
    return children;
  }

  return (
    <div ref={childRefProxy}>
      {
        Array.from({ length: isLastItem ? restOfUsers : USERS_PER_USER_LIST_PAGE }).map((_, index) => (
          <SkeletonUserListItem key={`not-visible-item-${index + 1}`} enableAnimation={intersecting} />
        ))
      }
    </div>
  );
};

export default IntersectionWatcher;
