import React, { useState } from 'react';
import { Paper } from '@mui/material';
import { injectIntl } from 'react-intl';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getActivityScore } from '../services/UserService';

const QuizzesChart = (props) => {
  const {
    allUsers,
    totalOfPolls,
    quizzes,
    intl,
  } = props;

  const [currentHoveredPoint, setCurrentHoveredPoint] = useState();

  if (!Object.keys(quizzes).length) return null;

  const chartData = [];

  Object.values(allUsers).forEach((u) => {
    if (u?.isModerator && Object.keys(u?.answers)?.length === 0) return;

    const result = Object
      .entries(quizzes || {})
      .map(([pollId, poll]) => {
        const userAnswers = u.answers[pollId] ?? [];
        const isCorrect = userAnswers.includes(poll.correctOption);
        return [pollId, isCorrect];
      });

    chartData.push({
      id: u.userKey,
      name: u.name,
      x: (getActivityScore(u, allUsers, totalOfPolls) / 10) * 100,
      y: (result.filter(([, isCorrect]) => isCorrect).length / Object.values(quizzes).length) * 100,
    });
  });

  return (
    <Paper>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
          onMouseLeave={() => {
            setCurrentHoveredPoint(null);
          }}
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name={intl.formatMessage({
              id: 'app.learningDashboard.quizzes.activityLevel',
              defaultMessage: 'Activity Level',
            })}
            label={{
              value: `${intl.formatMessage({
                id: 'app.learningDashboard.quizzes.activityLevel',
                defaultMessage: 'Activity Level',
              })} (%)`,
              position: 'bottom',
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={intl.formatMessage({
              id: 'app.learningDashboard.quizzes.quizScore',
              defaultMessage: 'Quiz Score',
            })}
            label={{
              value: `${intl.formatMessage({
                id: 'app.learningDashboard.quizzes.quizScore',
                defaultMessage: 'Quiz Score',
              })} (%)`,
              position: 'insideLeft',
              angle: -90,
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={(tooltipProps) => {
              const { active } = tooltipProps;
              const isVisible = active && currentHoveredPoint;
              return (
                <Paper style={{ visibility: isVisible ? 'visible' : 'hidden' }} className="p-2">
                  {isVisible && (
                    <>
                      <p className="font-bold">{currentHoveredPoint?.name}</p>
                      <p className="text-gray-600">
                        {`${intl.formatMessage({
                          id: 'app.learningDashboard.quizzes.activityLevel',
                          defaultMessage: 'Activity Level',
                        })}: ${currentHoveredPoint.node.x}%`}
                      </p>
                      <p className="text-gray-600">
                        {`${intl.formatMessage({
                          id: 'app.learningDashboard.quizzes.quizScore',
                          defaultMessage: 'Quiz Score',
                        })}: ${currentHoveredPoint.node.y}%`}
                      </p>
                    </>
                  )}
                </Paper>
              );
            }}
          />
          <Scatter
            name={intl.formatMessage({
              id: 'app.learningDashboard.quizzes.chartTitle',
              defaultMessage: 'Quiz Performance vs Activity Level',
            })}
            data={chartData}
            fill="#f97316"
            onMouseOver={(data) => {
              setCurrentHoveredPoint(data);
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default injectIntl(QuizzesChart);
