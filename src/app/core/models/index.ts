// ── Shared ────────────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ── IAM ───────────────────────────────────────────────────────────────────────

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; expiresInMs: number; role: string; }

export type UserRole = 'ADMIN' | 'SECRETARY' | 'PRIEST' | 'VIEWER';

// ── Scheduling ────────────────────────────────────────────────────────────────

export type CelebrationType =
  'MASS' | 'BAPTISM' | 'WEDDING' | 'FUNERAL' | 'CONFIRMATION' | 'FIRST_COMMUNION';

export type CelebrationStatus = 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface CelebrationResponse {
  id: string;
  type: CelebrationType;
  status: CelebrationStatus;
  scheduledAt: string;
  locationId: string;
  presidingPriestId: string;
  notes?: string;
  // MASS
  intention?: string;
  sundayMass?: boolean;
  // BAPTISM
  childId?: string;
  parentIds?: string[];
  godparentIds?: string[];
  // WEDDING
  spouseAId?: string;
  spouseBId?: string;
  witnessIds?: string[];
  documentationComplete?: boolean;
  // FUNERAL
  deceasedId?: string;
  burialLocation?: string;
  // CONFIRMATION
  candidateIds?: string[];
  bishopId?: string;
  // FIRST_COMMUNION
  catechismCompleted?: boolean;
}

export interface ScheduleMassRequest {
  scheduledAt: string;
  locationId: string;
  presidingPriestId: string;
  intention?: string;
  sundayMass: boolean;
}

export interface ScheduleBaptismRequest {
  scheduledAt: string;
  locationId: string;
  presidingPriestId: string;
  childId: string;
  parentIds: string[];
  godparentIds: string[];
}

export interface ScheduleWeddingRequest {
  scheduledAt: string;
  locationId: string;
  presidingPriestId: string;
  spouseAId: string;
  spouseBId: string;
  witnessIds: string[];
}

export interface ScheduleFuneralRequest {
  scheduledAt: string;
  locationId: string;
  presidingPriestId: string;
  deceasedId: string;
  burialLocation?: string;
}

export interface ScheduleConfirmationRequest {
  scheduledAt: string;
  locationId: string;
  presidingPriestId: string;
  candidateIds: string[];
  bishopId?: string;
}

export interface ScheduleFirstCommunionRequest {
  scheduledAt: string;
  locationId: string;
  presidingPriestId: string;
  candidateIds: string[];
}

export interface RescheduleRequest { newDateTime: string; }
export interface CancelRequest { reason: string; }

// ── Records ───────────────────────────────────────────────────────────────────

export type RecordType =
  'BAPTISM' | 'MARRIAGE' | 'FUNERAL' | 'CONFIRMATION' | 'FIRST_COMMUNION';

export interface RecordResponse {
  id: string;
  celebrationId: string;
  registeredOn: string;
  recordType: RecordType;
  notes?: string;
  // BAPTISM
  childId?: string;
  ministeringPriestId?: string;
  // MARRIAGE
  spouseAId?: string;
  spouseBId?: string;
  // FUNERAL
  deceasedId?: string;
  // CONFIRMATION
  bishopId?: string;
  candidateIds?: string[];
}

// ── Participants ──────────────────────────────────────────────────────────────

export type PersonRole = 'FAITHFUL' | 'DEACON' | 'PRIEST' | 'BISHOP';

export interface PersonResponse {
  id: string;
  firstName: string;
  lastName: string;
  role: PersonRole;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  role: PersonRole;
}

// ── Locations ─────────────────────────────────────────────────────────────────

export interface LocationResponse {
  id: string;
  name: string;
  address?: string;
  capacity: number;
  active: boolean;
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export interface CalendarEntry {
  celebrationId: string;
  type: CelebrationType;
  scheduledAt: string;
  locationId: string;
  locationName: string;
  presidingPriestId: string;
  presidingPriestName: string;
}
