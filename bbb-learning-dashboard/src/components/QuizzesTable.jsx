import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import UserAvatar from './UserAvatar';

const pollAnswerIds = {
  true: {
    id: 'app.poll.answer.true',
    description: 'label for poll answer True',
  },
  false: {
    id: 'app.poll.answer.false',
    description: 'label for poll answer False',
  },
  yes: {
    id: 'app.poll.answer.yes',
    description: 'label for poll answer Yes',
  },
  no: {
    id: 'app.poll.answer.no',
    description: 'label for poll answer No',
  },
  abstention: {
    id: 'app.poll.answer.abstention',
    description: 'label for poll answer Abstention',
  },
  a: {
    id: 'app.poll.answer.a',
    description: 'label for poll answer A',
  },
  b: {
    id: 'app.poll.answer.b',
    description: 'label for poll answer B',
  },
  c: {
    id: 'app.poll.answer.c',
    description: 'label for poll answer C',
  },
  d: {
    id: 'app.poll.answer.d',
    description: 'label for poll answer D',
  },
  e: {
    id: 'app.poll.answer.e',
    description: 'label for poll answer E',
  },
};

const QuizzesTable = (props) => {
  const {
    intl,
    quizzes,
    allUsers,
  } = props;

  if (typeof quizzes === 'object' && Object.values(quizzes).length === 0) {
    return (
      <div className="flex flex-col items-center py-24 bg-white">
        <div className="mb-1 p-3 rounded-full bg-orange-100 text-orange-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-700">
          <FormattedMessage
            id="app.learningDashboard.quizzes.noQuizzesCreatedHeading"
            defaultMessage="No quizzes have been created"
          />
        </p>
        <p className="mb-2 text-sm font-medium text-gray-600">
          <FormattedMessage
            id="app.learningDashboard.quizzes.noQuizzesCreatedMessage"
            defaultMessage="Once a quiz has been sent to users, their results will appear in this list."
          />
        </p>
      </div>
    );
  }

  const commonUserProps = {
    field: 'user',
    headerName: intl.formatMessage({ id: 'app.learningDashboard.quizzes.userLabel', defaultMessage: 'User' }),
    flex: 1,
    sortable: true,
  };

  const commonResponseCountProps = {
    field: 'numberOfResponses',
    headerName: intl.formatMessage({ id: 'app.learningDashboard.quizzes.numberOfResponses', defaultMessage: 'Number of responses' }),
    flex: 1,
    sortable: true,
  };

  const commonCorrectResponseCountProps = {
    field: 'totalCorrectResponses',
    headerName: intl.formatMessage({
      id: 'app.learningDashboard.quizzes.totalCorrectResponses',
      defaultMessage: 'Total correct responses',
    }),
    flex: 1,
    sortable: true,
  };

  const anonGridCols = [
    {
      ...commonUserProps,
      valueGetter: (params) => params?.row?.user?.name,
      renderCell: () => (
        <div className="flex items-center text-sm">
          <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="relative hidden w-8 h-8 mr-3 rounded-full md:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div
              className="absolute inset-0 rounded-full shadow-inner"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="font-semibold">
              <FormattedMessage id="app.learningDashboard.quizzes.anonymousRowName" defaultMessage="Anonymous" />
            </p>
          </div>
        </div>
      ),
    },
  ];

  const gridCols = [
    {
      ...commonUserProps,
      valueGetter: (params) => params?.row?.user?.name,
      renderCell: (params) => (
        <>
          <div className="relative hidden w-8 h-8 rounded-full md:block">
            <UserAvatar user={params?.row?.user} />
          </div>
          <div className="mx-2 font-semibold text-gray-700">{params?.value}</div>
        </>
      ),
    },
  ];

  anonGridCols.push({
    ...commonResponseCountProps,
    renderCell: () => '',
  });

  gridCols.push({
    ...commonResponseCountProps,
    valueGetter: (params) => Object.keys(params?.row?.user?.answers)
      .reduce((acc, ans) => (quizzes[ans] ? acc + 1 : acc), 0) || 0,
    renderCell: (params) => (
      <span className="font-bold">
        {params?.value}
      </span>
    ),
  });

  anonGridCols.push({
    ...commonCorrectResponseCountProps,
    renderCell: () => '',
  });

  gridCols.push({
    ...commonCorrectResponseCountProps,
    valueGetter: (params) => Object
      .keys(quizzes)
      .reduce(
        (acc, ans) => (
          (params?.row?.user?.answers[ans] || []).includes(quizzes[ans].correctOption)
            ? acc + 1
            : acc
        ), 0,
      ) || 0,
    renderCell: (params) => (
      <span className="font-bold">
        {params?.value}
      </span>
    ),
  });

  const isOverflown = (element) => (
    element.scrollHeight > element.clientHeight
    || element.scrollWidth > element.clientWidth
  );

  const GridCellExpand = React.memo((cellProps) => {
    const {
      width, anonymous, responses, type = 'default',
    } = cellProps;
    const wrapper = React.useRef(null);
    const cellDiv = React.useRef(null);
    const cellValue = React.useRef(null);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [showFullCell, setShowFullCell] = React.useState(false);
    const [showPopper, setShowPopper] = React.useState(false);

    const handleMouseEnter = () => {
      const isCurrentlyOverflown = isOverflown(cellValue.current);
      setShowPopper(isCurrentlyOverflown);
      setAnchorEl(cellDiv.current);
      setShowFullCell(true);
    };

    const handleMouseLeave = () => {
      setShowFullCell(false);
    };

    React.useEffect(() => {
      if (!showFullCell) {
        return undefined;
      }

      function handleKeyDown(nativeEvent) {
        if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
          setShowFullCell(false);
        }
      }

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [setShowFullCell, showFullCell]);

    if (anonymous) {
      return (
        <span title={intl.formatMessage({
          id: 'app.learningDashboard.quizzes.anonymousAnswer',
          defaultMessage: 'Anonymous Quiz (answers in the last row)',
        })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 inline"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      );
    }

    const variants = {
      success: '',
      error: '',
      default: 'bg-gray-500/10 text-gray-700 border border-gray-300 rounded-full px-2 font-bold',
    };

    return (
      <Box
        ref={wrapper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          alignItems: 'flex-start',
          lineHeight: '24px',
          width: 1,
          height: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          ref={cellDiv}
          sx={{
            height: 1,
            width,
            display: 'block',
            position: 'absolute',
            top: 0,
          }}
        />
        <Box
          ref={cellValue}
          sx={{
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}
          className={variants[type]}
        >
          {type === 'success' && <>&#9989;</>}
          {type === 'error' && <>&#10060;</>}
          {responses.length ? (
            <>
              &nbsp;
              {responses.map((response) => {
                const key = pollAnswerIds[response.toLowerCase()]
                  ? [intl.formatMessage(pollAnswerIds[response.toLowerCase()])] : response;
                return key;
              }).join(', ')}
            </>
          ) : intl.formatMessage({
            id: 'app.learningDashboard.quizzes.noResponse',
            defaultMessage: 'No response',
          })}
        </Box>
        {showPopper && (
          <Popper
            open={showFullCell && anchorEl !== null}
            anchorEl={anchorEl}
          >
            <Paper elevation={1}>
              <Typography variant="body2" style={{ padding: 8, whiteSpace: 'nowrap' }}>
                {responses.length ? (
                  responses.map((response) => {
                    const key = pollAnswerIds[response.toLowerCase()]
                      ? [intl.formatMessage(pollAnswerIds[response.toLowerCase()])] : response;
                    return key;
                  }).join(', ')
                ) : intl.formatMessage({
                  id: 'app.learningDashboard.quizzes.noResponse',
                  defaultMessage: 'No response',
                })}
              </Typography>
            </Paper>
          </Popper>
        )}
      </Box>
    );
  });

  let hasAnonymousQuiz = false;
  const initQuizData = {};
  const anonymousQuizData = {};
  const anonGridRow = [];
  const gridRows = [];

  Object.values(quizzes).map((v, i) => {
    initQuizData[`${v?.pollId}`] = '';
    const headerName = v?.question?.length > 0 ? v?.question : `Quiz ${i + 1}`;
    if (v?.anonymous) {
      hasAnonymousQuiz = true;
      anonymousQuizData[`${v?.pollId}`] = v?.anonymousAnswers;
    }

    const commonColProps = {
      field: v?.pollId,
      headerName,
      flex: 1,
    };

    anonGridCols.push({
      ...commonColProps,
      sortable: false,
      renderCell: (params) => (
        <GridCellExpand responses={params?.value || []} width={params?.colDef?.computedWidth} />
      ),
    });

    gridCols.push({
      ...commonColProps,
      sortable: true,
      valueGetter: (params) => {
        const [, userAnswers] = params?.value;
        return userAnswers || [];
      },
      renderCell: (params) => {
        let type = 'default';
        const [isCorrect] = params?.row[params?.field];
        if (isCorrect != null) {
          type = isCorrect ? 'success' : 'error';
        }
        return (
          <GridCellExpand
            type={type}
            anonymous={v?.anonymous}
            responses={params?.value || []}
            width={params?.colDef?.computedWidth}
          />
        );
      },
    });
    return v;
  });

  Object.values(allUsers).forEach((u, i) => {
    if (u?.isModerator && Object.keys(u?.answers)?.length === 0) return;

    const result = Object
      .entries(quizzes || {})
      .map(([quizId, quiz]) => {
        const userAnswers = u.answers[quizId];
        const isCorrect = userAnswers ? userAnswers.includes(quiz.correctOption) : null;
        return [quizId, [isCorrect, userAnswers ?? []]];
      });

    gridRows.push({
      id: i + 1,
      user: u,
      ...{
        ...initQuizData,
        ...(Object.fromEntries(result)),
      },
    });
  });

  if (hasAnonymousQuiz) {
    anonGridRow.push({
      id: 1,
      user: {
        name: intl.formatMessage({
          id: 'app.learningDashboard.quizzes.anonymousRowName',
          defaultMessage: 'Anonymous',
        }),
      },
      ...{ ...initQuizData, ...anonymousQuizData },
    });
  }

  const commonGridProps = {
    autoHeight: true,
    hideFooter: true,
    disableColumnMenu: true,
    disableColumnSelector: true,
    disableSelectionOnClick: true,
    rowHeight: 60,
  };

  const anonymousDataGrid = (
    <DataGrid
      {...commonGridProps}
      rows={anonGridRow}
      columns={anonGridCols}
      sx={{
        '& .MuiDataGrid-columnHeaders': {
          display: 'none',
        },
        '& .MuiDataGrid-virtualScroller': {
          marginTop: '0 !important',
        },
      }}
    />
  );

  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        {...commonGridProps}
        rows={gridRows}
        columns={gridCols}
        sortingOrder={['asc', 'desc']}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgb(243 244 246/var(--tw-bg-opacity))',
            color: 'rgb(55 65 81/1)',
            textTransform: 'uppercase',
            letterSpacing: '.025em',
            minHeight: '40.5px !important',
            maxHeight: '40.5px !important',
            height: '40.5px !important',
          },
          '& .MuiDataGrid-virtualScroller': {
            marginTop: '40.5px !important',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: '600',
            fontSize: 'smaller !important',
          },
        }}
      />
      {hasAnonymousQuiz && anonymousDataGrid}
    </div>
  );
};

export default injectIntl(QuizzesTable);
