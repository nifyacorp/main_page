import React from 'react';
import MainLayout from '../components/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary';

const Landing: React.FC = () => {
  console.log('Landing: Component rendering');
  
  return (
    <ErrorBoundary section="Landing page">
      <MainLayout hideNav={true} />
    </ErrorBoundary>
  );
};

export default Landing; 