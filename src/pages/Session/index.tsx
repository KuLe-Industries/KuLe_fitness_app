import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { planRepo, exerciseRepo } from '@/domain/repositories/impl';
import { useSessionStore } from '@/stores/sessionStore';
import type { WorkoutPlan, Exercise } from '@/domain/types';
import Preflight from './Preflight';
import Active from './Active';
import Summary from './Summary';

export default function Session() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [phase, setPhase] = useState<'preflight' | 'active' | 'summary'>('preflight');
  const { currentSession, isActive, loadActiveSession, startSession } = useSessionStore();

  useEffect(() => {
    loadActiveSession();
  }, []);

  useEffect(() => {
    if (currentSession && !currentSession.endedAt) {
      setPhase('active');
    } else if (currentSession && currentSession.endedAt) {
      setPhase('summary');
    } else {
      setPhase('preflight');
    }
  }, [currentSession]);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
    loadExercises();
  }, [planId]);

  const loadPlan = async () => {
    if (!planId) return;
    const loaded = await planRepo.getById(planId);
    setPlan(loaded);
  };

  const loadExercises = async () => {
    const all = await exerciseRepo.getAll();
    setExercises(all);
  };

  const handleStart = async () => {
    await startSession(plan?.id);
    setPhase('active');
  };

  const handleEnd = () => {
    setPhase('summary');
  };

  if (phase === 'preflight') {
    return <Preflight plan={plan} exercises={exercises} onStart={handleStart} />;
  }

  if (phase === 'active') {
    return <Active plan={plan} exercises={exercises} onEnd={handleEnd} />;
  }

  return <Summary session={currentSession} exercises={exercises} />;
}

