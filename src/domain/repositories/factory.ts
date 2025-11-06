// Repository Factory - Switches between local storage and Google Sheets
import {
  userRepo,
  exerciseRepo,
  planRepo,
  sessionRepo,
} from './impl';
import {
  googleSheetsUserRepo,
  googleSheetsExerciseRepo,
  googleSheetsPlanRepo,
  googleSheetsSessionRepo,
} from './googleSheets';
import type {
  UserRepository,
  ExerciseRepository,
  PlanRepository,
  SessionRepository,
} from '../repositories';

let useGoogleSheets = false;

export function initializeRepositories() {
  const config = localStorage.getItem('kule_google_sheets_config');
  if (config) {
    try {
      const parsed = JSON.parse(config);
      useGoogleSheets = parsed.enabled === true;
      
      if (useGoogleSheets && parsed.apiKey && parsed.spreadsheetId) {
        const { googleSheetsService } = require('@/services/googleSheets');
        googleSheetsService.initialize({
          apiKey: parsed.apiKey,
          spreadsheetId: parsed.spreadsheetId,
        });
      }
    } catch (e) {
      console.error('Failed to load repository config', e);
      useGoogleSheets = false;
    }
  }
}

export function getUserRepo(): UserRepository {
  return useGoogleSheets ? googleSheetsUserRepo : userRepo;
}

export function getExerciseRepo(): ExerciseRepository {
  return useGoogleSheets ? googleSheetsExerciseRepo : exerciseRepo;
}

export function getPlanRepo(): PlanRepository {
  return useGoogleSheets ? googleSheetsPlanRepo : planRepo;
}

export function getSessionRepo(): SessionRepository {
  return useGoogleSheets ? googleSheetsSessionRepo : sessionRepo;
}

// Export default repos (will be swapped based on config)
export const userRepository = userRepo;
export const exerciseRepository = exerciseRepo;
export const planRepository = planRepo;
export const sessionRepository = sessionRepo;

