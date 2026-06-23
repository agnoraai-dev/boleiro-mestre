export type SavedPrediction = {
  id: string;
  competition_id: string;
  match_id: string | null;
  team_a_id: string | null;
  team_b_id: string | null;
  user_id: string;
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  probability_a: number;
  probability_draw: number;
  probability_b: number;
  commentary: string;
  created_at: string;
};
