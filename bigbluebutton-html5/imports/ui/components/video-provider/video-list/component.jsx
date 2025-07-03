import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { throttle } from '/imports/utils/throttle';
import { range } from '/imports/utils/array-utils';
import Styled from './styles';
import VideoListItemContainer from './video-list-item/container';
import AutoplayOverlay from '../../media/autoplay-overlay/component';
import logger from '/imports/startup/client/logger';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import VideoService from '/imports/ui/components/video-provider/service';
import { ACTIONS } from '../../layout/enums';

const propTypes = {
  streams: PropTypes.arrayOf(PropTypes.object).isRequired,
  onVideoItemMount: PropTypes.func.isRequired,
  onVideoItemUnmount: PropTypes.func.isRequired,
  intl: PropTypes.objectOf(Object).isRequired,
  swapLayout: PropTypes.bool.isRequired,
  numberOfPages: PropTypes.number.isRequired,
  currentVideoPageIndex: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  autoplayBlockedDesc: {
    id: 'app.videoDock.autoplayBlockedDesc',
  },
  autoplayAllowLabel: {
    id: 'app.videoDock.autoplayAllowLabel',
  },
  nextPageLabel: {
    id: 'app.video.pagination.nextPage',
  },
  prevPageLabel: {
    id: 'app.video.pagination.prevPage',
  },
});

const findOptimalGrid = (canvasWidth, canvasHeight, gutter, aspectRatio, numItems, columns = 1) => {
  const rows = Math.ceil(numItems / columns);
  const gutterTotalWidth = (columns - 1) * gutter;
  const gutterTotalHeight = (rows - 1) * gutter;
  const usableWidth = canvasWidth - gutterTotalWidth;
  const usableHeight = canvasHeight - gutterTotalHeight;
  let cellWidth = Math.floor(usableWidth / columns);
  let cellHeight = Math.ceil(cellWidth / aspectRatio);
  if ((cellHeight * rows) > usableHeight) {
    cellHeight = Math.floor(usableHeight / rows);
    cellWidth = Math.ceil(cellHeight * aspectRatio);
  }
  return {
    columns,
    rows,
    width: (cellWidth * columns) + gutterTotalWidth,
    height: (cellHeight * rows) + gutterTotalHeight,
    filledArea: (cellWidth * cellHeight) * numItems,
  };
};

const ASPECT_RATIO = 4 / 3;
// const ACTION_NAME_BACKGROUND = 'blurBackground';

class VideoList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      optimalGrid: {
        cols: 1,
        rows: 1,
        filledArea: 0,
      },
      autoplayBlocked: false,
    };

    this.ticking = false;
    this.grid = null;
    this.canvas = null;
    this.failedMediaElements = [];
    this.handleCanvasResize = throttle(this.handleCanvasResize.bind(this), 66,
      {
        leading: true,
        trailing: true,
      });
    this.setOptimalGrid = this.setOptimalGrid.bind(this);
    this.handleAllowAutoplay = this.handleAllowAutoplay.bind(this);
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.autoplayWasHandled = false;
  }

  componentDidMount() {
    this.handleCanvasResize();
    window.addEventListener('resize', this.handleCanvasResize, false);
    window.addEventListener('videoPlayFailed', this.handlePlayElementFailed);
  }

  componentDidUpdate(prevProps) {
    const { layoutType, cameraDock, streams, focusedId } = this.props;
    const { width: cameraDockWidth, height: cameraDockHeight } = cameraDock;
    const {
      layoutType: prevLayoutType,
      cameraDock: prevCameraDock,
      streams: prevStreams,
      focusedId: prevFocusedId,
    } = prevProps;
    const { width: prevCameraDockWidth, height: prevCameraDockHeight } = prevCameraDock;

    if (layoutType !== prevLayoutType
      || focusedId !== prevFocusedId
      || cameraDockWidth !== prevCameraDockWidth
      || cameraDockHeight !== prevCameraDockHeight
      || streams.length !== prevStreams.length) {
      this.handleCanvasResize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleCanvasResize, false);
    window.removeEventListener('videoPlayFailed', this.handlePlayElementFailed);
  }

  handleAllowAutoplay() {
    const { autoplayBlocked } = this.state;

    logger.info({
      logCode: 'video_provider_autoplay_allowed',
    }, 'Video media autoplay allowed by the user');

    this.autoplayWasHandled = true;
    window.removeEventListener('videoPlayFailed', this.handlePlayElementFailed);
    while (this.failedMediaElements.length) {
      const mediaElement = this.failedMediaElements.shift();
      if (mediaElement) {
        const played = playAndRetry(mediaElement);
        if (!played) {
          logger.error({
            logCode: 'video_provider_autoplay_handling_failed',
          }, 'Video autoplay handling failed to play media');
        } else {
          logger.info({
            logCode: 'video_provider_media_play_success',
          }, 'Video media played successfully');
        }
      }
    }
    if (autoplayBlocked) { this.setState({ autoplayBlocked: false }); }
  }

  handlePlayElementFailed(e) {
    const { mediaElement } = e.detail;
    const { autoplayBlocked } = this.state;

    e.stopPropagation();
    this.failedMediaElements.push(mediaElement);
    if (!autoplayBlocked && !this.autoplayWasHandled) {
      logger.info({
        logCode: 'video_provider_autoplay_prompt',
      }, 'Prompting user for action to play video media');
      this.setState({ autoplayBlocked: true });
    }
  }

  handleCanvasResize() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.ticking = false;
        this.setOptimalGrid();
      });
    }
    this.ticking = true;
  }

  setOptimalGrid() {
    const {
      streams,
      cameraDock,
      layoutContextDispatch,
    } = this.props;
    let numItems = streams.length;

    if (numItems < 1 || !this.canvas || !this.grid) {
      return;
    }
    const { focusedId } = this.props;
    const canvasWidth = cameraDock?.width;
    const canvasHeight = cameraDock?.height;

    const gridGutter = parseInt(window.getComputedStyle(this.grid)
      .getPropertyValue('grid-row-gap'), 10);

    const hasFocusedItem = streams.filter(s => s.stream === focusedId).length && numItems > 2;

    // Has a focused item so we need +3 cells
    if (hasFocusedItem) {
      numItems += 3;
    }
    const optimalGrid = range(1, numItems + 1)
      .reduce((currentGrid, col) => {
        const testGrid = findOptimalGrid(
          canvasWidth, canvasHeight, gridGutter,
          ASPECT_RATIO, numItems, col,
        );
        // We need a minimun of 2 rows and columns for the focused
        const focusedConstraint = hasFocusedItem ? testGrid.rows > 1 && testGrid.columns > 1 : true;
        const betterThanCurrent = testGrid.filledArea > currentGrid.filledArea;
        return focusedConstraint && betterThanCurrent ? testGrid : currentGrid;
      }, { filledArea: 0 });
    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_OPTIMAL_GRID_SIZE,
      value: {
        width: optimalGrid.width,
        height: optimalGrid.height,
      },
    });
    this.setState({
      optimalGrid,
    });
  }

  displayPageButtons() {
    const { numberOfPages, cameraDock } = this.props;
    const { width: cameraDockWidth } = cameraDock;

    if (!VideoService.isPaginationEnabled() || numberOfPages <= 1 || cameraDockWidth === 0) {
      return false;
    }

    return true;
  }

  renderNextPageButton() {
    const {
      intl,
      numberOfPages,
      currentVideoPageIndex,
      cameraDock,
    } = this.props;
    const { position } = cameraDock;

    if (!this.displayPageButtons()) return null;

    const currentPage = currentVideoPageIndex + 1;
    const nextPageLabel = intl.formatMessage(intlMessages.nextPageLabel);
    const nextPageDetailedLabel = `${nextPageLabel} (${currentPage}/${numberOfPages})`;

    return (
      <Styled.NextPageButton
        role="button"
        aria-label={nextPageLabel}
        color="primary"
        icon="right_arrow"
        size="md"
        onClick={VideoService.getNextVideoPage}
        label={nextPageDetailedLabel}
        hideLabel
        position={position}
      />
    );
  }

  renderPreviousPageButton() {
    const {
      intl,
      currentVideoPageIndex,
      numberOfPages,
      cameraDock,
    } = this.props;
    const { position } = cameraDock;

    if (!this.displayPageButtons()) return null;

    const currentPage = currentVideoPageIndex + 1;
    const prevPageLabel = intl.formatMessage(intlMessages.prevPageLabel);
    const prevPageDetailedLabel = `${prevPageLabel} (${currentPage}/${numberOfPages})`;

    return (
      <Styled.PreviousPageButton
        role="button"
        aria-label={prevPageLabel}
        color="primary"
        icon="left_arrow"
        size="md"
        onClick={VideoService.getPreviousVideoPage}
        label={prevPageDetailedLabel}
        hideLabel
        position={position}
      />
    );
  }

  renderVideoList() {
    const {
      streams,
      onVirtualBgDrop,
      onVideoItemMount,
      onVideoItemUnmount,
      swapLayout,
      handleVideoFocus,
      focusedId,
      layoutType,
      pinnedUsers = [], // массив закрепленных пользователей для больших окон
    } = this.props;
    const numOfStreams = streams.length;
    let videoItems = streams;

    // Кастомная раскладка: 2 большие сверху, 8 маленьких снизу
    if (layoutType === 'custom2x8') {
      // pinnedUsers: [userId1, userId2] — кто в больших окнах
      const bigUsers = pinnedUsers.slice(0, 2);
      const smallUsers = videoItems.filter(item => !bigUsers.includes(item.userId)).slice(0, 8);
      const bigItems = videoItems.filter(item => bigUsers.includes(item.userId));
      // Остальные — на следующий ряд (overflow)
      const overflow = videoItems.filter(item => !bigUsers.includes(item.userId)).slice(8);
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            {bigItems.map(item => (
              <Styled.VideoListItem key={item.userId} style={{ flex: 1, minWidth: 0, minHeight: 180, maxWidth: 320 }}>
                <VideoListItemContainer
                  {...item}
                  numOfStreams={numOfStreams}
                  focused={false}
                  swapLayout={swapLayout}
                  onHandleVideoFocus={handleVideoFocus}
                  onVideoItemMount={onVideoItemMount}
                  onVideoItemUnmount={onVideoItemUnmount}
                  onVirtualBgDrop={onVirtualBgDrop}
                />
              </Styled.VideoListItem>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {smallUsers.map(item => (
              <Styled.VideoListItem key={item.userId} style={{ width: 120, minHeight: 90, margin: 2 }}>
                <VideoListItemContainer
                  {...item}
                  numOfStreams={numOfStreams}
                  focused={false}
                  swapLayout={swapLayout}
                  onHandleVideoFocus={handleVideoFocus}
                  onVideoItemMount={onVideoItemMount}
                  onVideoItemUnmount={onVideoItemUnmount}
                  onVirtualBgDrop={onVirtualBgDrop}
                />
              </Styled.VideoListItem>
            ))}
          </div>
          {overflow.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              {overflow.map(item => (
                <Styled.VideoListItem key={item.userId} style={{ width: 120, minHeight: 90, margin: 2, opacity: 0.7 }}>
                  <VideoListItemContainer
                    {...item}
                    numOfStreams={numOfStreams}
                    focused={false}
                    swapLayout={swapLayout}
                    onHandleVideoFocus={handleVideoFocus}
                    onVideoItemMount={onVideoItemMount}
                    onVideoItemUnmount={onVideoItemUnmount}
                    onVirtualBgDrop={onVirtualBgDrop}
                  />
                </Styled.VideoListItem>
              ))}
            </div>
          )}
        </>
      );
    }
    // Кастомная раскладка: 1 большая сверху, 8 маленьких снизу
    if (layoutType === 'custom1x8') {
      const bigUser = pinnedUsers[0];
      const bigItem = videoItems.find(item => item.userId === bigUser);
      const smallUsers = videoItems.filter(item => item.userId !== bigUser).slice(0, 8);
      const overflow = videoItems.filter(item => item.userId !== bigUser).slice(8);
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            {bigItem && (
              <Styled.VideoListItem key={bigItem.userId} style={{ flex: 1, minWidth: 0, minHeight: 180, maxWidth: 320 }}>
                <VideoListItemContainer
                  {...bigItem}
                  numOfStreams={numOfStreams}
                  focused={false}
                  swapLayout={swapLayout}
                  onHandleVideoFocus={handleVideoFocus}
                  onVideoItemMount={onVideoItemMount}
                  onVideoItemUnmount={onVideoItemUnmount}
                  onVirtualBgDrop={onVirtualBgDrop}
                />
              </Styled.VideoListItem>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {smallUsers.map(item => (
              <Styled.VideoListItem key={item.userId} style={{ width: 120, minHeight: 90, margin: 2 }}>
                <VideoListItemContainer
                  {...item}
                  numOfStreams={numOfStreams}
                  focused={false}
                  swapLayout={swapLayout}
                  onHandleVideoFocus={handleVideoFocus}
                  onVideoItemMount={onVideoItemMount}
                  onVideoItemUnmount={onVideoItemUnmount}
                  onVirtualBgDrop={onVirtualBgDrop}
                />
              </Styled.VideoListItem>
            ))}
          </div>
          {overflow.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              {overflow.map(item => (
                <Styled.VideoListItem key={item.userId} style={{ width: 120, minHeight: 90, margin: 2, opacity: 0.7 }}>
                  <VideoListItemContainer
                    {...item}
                    numOfStreams={numOfStreams}
                    focused={false}
                    swapLayout={swapLayout}
                    onHandleVideoFocus={handleVideoFocus}
                    onVideoItemMount={onVideoItemMount}
                    onVideoItemUnmount={onVideoItemUnmount}
                    onVirtualBgDrop={onVirtualBgDrop}
                  />
                </Styled.VideoListItem>
              ))}
            </div>
          )}
        </>
      );
    }
    // Кастомная раскладка: центр большая, снизу 6, справа 4
    if (layoutType === 'customCenter6_4') {
      const bigUser = pinnedUsers[0];
      const bigItem = videoItems.find(item => item.userId === bigUser);
      const bottomUsers = videoItems.filter(item => item.userId !== bigUser).slice(0, 6);
      const rightUsers = videoItems.filter(item => item.userId !== bigUser).slice(6, 10);
      const overflow = videoItems.filter(item => item.userId !== bigUser).slice(10);
      return (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: 320 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {bigItem && (
                <Styled.VideoListItem key={bigItem.userId} style={{ minWidth: 220, minHeight: 220, maxWidth: 400 }}>
                  <VideoListItemContainer
                    {...bigItem}
                    numOfStreams={numOfStreams}
                    focused={false}
                    swapLayout={swapLayout}
                    onHandleVideoFocus={handleVideoFocus}
                    onVideoItemMount={onVideoItemMount}
                    onVideoItemUnmount={onVideoItemUnmount}
                    onVirtualBgDrop={onVirtualBgDrop}
                  />
                </Styled.VideoListItem>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              {bottomUsers.map(item => (
                <Styled.VideoListItem key={item.userId} style={{ width: 110, minHeight: 80, margin: 2 }}>
                  <VideoListItemContainer
                    {...item}
                    numOfStreams={numOfStreams}
                    focused={false}
                    swapLayout={swapLayout}
                    onHandleVideoFocus={handleVideoFocus}
                    onVideoItemMount={onVideoItemMount}
                    onVideoItemUnmount={onVideoItemUnmount}
                    onVirtualBgDrop={onVirtualBgDrop}
                  />
                </Styled.VideoListItem>
              ))}
            </div>
          </div>
          <div style={{ width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8 }}>
            {rightUsers.map(item => (
              <Styled.VideoListItem key={item.userId} style={{ width: 120, minHeight: 80, margin: 2 }}>
                <VideoListItemContainer
                  {...item}
                  numOfStreams={numOfStreams}
                  focused={false}
                  swapLayout={swapLayout}
                  onHandleVideoFocus={handleVideoFocus}
                  onVideoItemMount={onVideoItemMount}
                  onVideoItemUnmount={onVideoItemUnmount}
                  onVirtualBgDrop={onVirtualBgDrop}
                />
              </Styled.VideoListItem>
            ))}
          </div>
          {overflow.length > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              {overflow.map(item => (
                <Styled.VideoListItem key={item.userId} style={{ width: 110, minHeight: 80, margin: 2, opacity: 0.7 }}>
                  <VideoListItemContainer
                    {...item}
                    numOfStreams={numOfStreams}
                    focused={false}
                    swapLayout={swapLayout}
                    onHandleVideoFocus={handleVideoFocus}
                    onVideoItemMount={onVideoItemMount}
                    onVideoItemUnmount={onVideoItemUnmount}
                    onVirtualBgDrop={onVirtualBgDrop}
                  />
                </Styled.VideoListItem>
              ))}
            </div>
          )}
        </div>
      );
    }

    return videoItems.map((item) => {
      const { userId, name } = item;
      const isStream = !!item.stream;
      const stream = isStream ? item.stream : null;
      const key = isStream ? stream : userId;
      const isFocused = isStream && focusedId === stream && numOfStreams > 2;

      return (
        <Styled.VideoListItem
          key={key}
          focused={isFocused}
          data-test="webcamVideoItem"
        >
          <VideoListItemContainer
            numOfStreams={numOfStreams}
            cameraId={stream}
            userId={userId}
            name={name}
            focused={isFocused}
            isStream={isStream}
            onHandleVideoFocus={isStream ? handleVideoFocus : null}
            onVideoItemMount={(videoRef) => {
              this.handleCanvasResize();
              if (isStream) onVideoItemMount(stream, videoRef);
            }}
            onVideoItemUnmount={onVideoItemUnmount}
            swapLayout={swapLayout}
            onVirtualBgDrop={(type, name, data) => { return isStream ? onVirtualBgDrop(stream, type, name, data) : null; }}
          />
        </Styled.VideoListItem>
      );
    });
  }

  render() {
    const {
      streams,
      intl,
      cameraDock,
      isGridEnabled,
    } = this.props;
    const { optimalGrid, autoplayBlocked } = this.state;
    const { position } = cameraDock;

    return (
      <Styled.VideoCanvas
        position={position}
        ref={(ref) => {
          this.canvas = ref;
        }}
        style={{
          minHeight: 'inherit',
        }}
      >
        {this.renderPreviousPageButton()}

        {!streams.length && !isGridEnabled ? null : (
          <Styled.VideoList
            ref={(ref) => {
              this.grid = ref;
            }}
            style={{
              width: `${optimalGrid.width}px`,
              height: `${optimalGrid.height}px`,
              gridTemplateColumns: `repeat(${optimalGrid.columns}, 1fr)`,
              gridTemplateRows: `repeat(${optimalGrid.rows}, 1fr)`,
            }}
          >
            {this.renderVideoList()}
          </Styled.VideoList>
        )}
        {!autoplayBlocked ? null : (
          <AutoplayOverlay
            autoplayBlockedDesc={intl.formatMessage(intlMessages.autoplayBlockedDesc)}
            autoplayAllowLabel={intl.formatMessage(intlMessages.autoplayAllowLabel)}
            handleAllowAutoplay={this.handleAllowAutoplay}
          />
        )}

        {
          (position === 'contentRight' || position === 'contentLeft')
          && <Styled.Break />
        }

        {this.renderNextPageButton()}
      </Styled.VideoCanvas>
    );
  }
}

VideoList.propTypes = propTypes;

export default injectIntl(VideoList);
