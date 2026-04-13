import React, { createContext, useContext, useState, useEffect } from 'react';

const BioStateContext = createContext();

export const useBioState = () => useContext(BioStateContext);

export const BioStateProvider = ({ children }) => {
  // Existing baseline state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);
  const [dopamineScore, setDopamineScore] = useState(72);
  const [screenTime, setScreenTime] = useState({ hours: 4, minutes: 20 });
  const [sleepRisk, setSleepRisk] = useState('High'); 
  const [companionMood, setCompanionMood] = useState('concerned'); 
  const [companionMessage, setCompanionMessage] = useState("We've been scrolling for a while...");
  
  // Phase 2 state
  const [isSleepModeActive, setIsSleepModeActive] = useState(false);
  const [showMicroChallenge, setShowMicroChallenge] = useState(false);

  // New Smart Action State
  const [feedFadeActive, setFeedFadeActive] = useState(false);
  const [dimScreenActive, setDimScreenActive] = useState(false);
  const [breathingExerciseRecommended, setBreathingExerciseRecommended] = useState(false);
  const [focusModeRecommended, setFocusModeRecommended] = useState(false);

  // Raw Metrics (Hidden from user, simulated)
  const [rawMetrics, setRawMetrics] = useState({
    totalScreenTime: 260, // minutes
    notifications: 45,
    afterMidnightTime: 120, // minutes
    reelsWatched: 80,
    brightnessLevel: 90, // %
    appSwitches: 150,
    scrollingDuration: 40 // continuous minutes
  });

  // Derived Metrics (0-100 scale)
  const [derivedMetrics, setDerivedMetrics] = useState({
    sleepDebt: 65,
    stressLevel: 50,
    dopamineOverload: 72,
    focusStability: 40,
    mentalFatigue: 60,
    eyeStrainRisk: 75,
    notificationOverload: 55,
    productivityLoss: 45,
    lateNightImpact: 80,
    rapidAppSwitching: 60
  });

  // Simulation Loop
  useEffect(() => {
    if (!hasCompletedOnboarding) return;

    const timer = setInterval(() => {
      // 1. Advance Raw Metrics
      setRawMetrics(prev => {
        const afterMidnightTime = prev.afterMidnightTime + (Math.random() > 0.5 ? 1 : 0);
        const notifications = prev.notifications + (Math.random() > 0.7 ? 1 : 0);
        const appSwitches = prev.appSwitches + (Math.random() > 0.6 ? 2 : 0);
        const scrollingDuration = prev.scrollingDuration + 1;
        const reelsWatched = prev.reelsWatched + (Math.random() > 0.5 ? 1 : 0);
        const brightnessLevel = prev.brightnessLevel;
        const totalScreenTime = prev.totalScreenTime + 1;

        return {
          totalScreenTime,
          notifications,
          afterMidnightTime,
          reelsWatched,
          brightnessLevel,
          appSwitches,
          scrollingDuration
        };
      });

      // 2. Compute Derived Metrics
      setDerivedMetrics(prev => {
        return {
          sleepDebt: Math.min(100, prev.sleepDebt + (Math.random() > 0.6 ? 1 : 0)),
          stressLevel: Math.min(100, prev.stressLevel + (Math.random() > 0.7 ? 1 : 0)),
          dopamineOverload: Math.min(100, prev.dopamineOverload + (Math.random() > 0.5 ? 1 : 0)),
          focusStability: Math.max(0, prev.focusStability - (Math.random() > 0.6 ? 1 : 0)), // decreases
          mentalFatigue: Math.min(100, prev.mentalFatigue + (Math.random() > 0.5 ? 1 : 0)),
          eyeStrainRisk: Math.min(100, prev.eyeStrainRisk + (Math.random() > 0.5 ? 1 : 0)),
          notificationOverload: Math.min(100, prev.notificationOverload + (Math.random() > 0.7 ? 1 : 0)),
          productivityLoss: Math.min(100, prev.productivityLoss + (Math.random() > 0.8 ? 1 : 0)),
          lateNightImpact: Math.min(100, prev.lateNightImpact + (Math.random() > 0.6 ? 1 : 0)),
          rapidAppSwitching: Math.min(100, prev.rapidAppSwitching + (Math.random() > 0.5 ? 1 : 0))
        };
      });

      // Update basic screen time display
      setScreenTime(prev => {
        let newMin = prev.minutes + 1;
        let newHr = prev.hours;
        if (newMin >= 60) {
           newMin = 0;
           newHr += 1;
        }
        return { hours: newHr, minutes: newMin };
      });

    }, 3000); // 3 seconds for demo visibility

    return () => clearInterval(timer);
  }, [hasCompletedOnboarding]);

  // Smart Action Evaluator
  useEffect(() => {
    if (!hasCompletedOnboarding) return;

    // Legacy dopamine link
    setDopamineScore(derivedMetrics.dopamineOverload);

    // Sleep Debt -> Sleep Mode
    if (derivedMetrics.sleepDebt > 85 && !isSleepModeActive) {
      setIsSleepModeActive(true);
    }

    // Dopamine Overload -> Feed Fade
    if (derivedMetrics.dopamineOverload > 85 && !feedFadeActive) {
      setFeedFadeActive(true);
    }

    // Stress Level -> Breathing Exercise
    if (derivedMetrics.stressLevel > 80 && !breathingExerciseRecommended) {
      setBreathingExerciseRecommended(true);
    }

    // Eye Strain Risk -> Dim Screen
    if (derivedMetrics.eyeStrainRisk > 80 && !dimScreenActive) {
      setDimScreenActive(true);
    }

    // Focus Stability -> Recommend Focus Mode
    if (derivedMetrics.focusStability < 30 && !focusModeRecommended) {
      setFocusModeRecommended(true);
    }

  }, [derivedMetrics, hasCompletedOnboarding]);

  return (
    <BioStateContext.Provider value={{
      hasSeenSplash, setHasSeenSplash,
      hasAuthenticated, setHasAuthenticated,
      hasCompletedOnboarding, setHasCompletedOnboarding,
      dopamineScore, setDopamineScore,
      screenTime, setScreenTime,
      sleepRisk, setSleepRisk,
      companionMood, setCompanionMood,
      companionMessage, setCompanionMessage,
      isSleepModeActive, setIsSleepModeActive,
      showMicroChallenge, setShowMicroChallenge,
      derivedMetrics,
      rawMetrics,
      feedFadeActive, setFeedFadeActive,
      dimScreenActive, setDimScreenActive,
      breathingExerciseRecommended, setBreathingExerciseRecommended,
      focusModeRecommended, setFocusModeRecommended
    }}>
      {children}
    </BioStateContext.Provider>
  );
};
