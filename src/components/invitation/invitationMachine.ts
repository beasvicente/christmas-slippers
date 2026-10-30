export const INVITATION_SCENES = ["sealed", "letter", "gift", "completed"] as const;

export type InvitationScene = (typeof INVITATION_SCENES)[number];
export type InvitationEvent = "OPEN" | "CONTINUE" | "UNWRAP" | "REPLAY";

const transitions: Record<InvitationScene, Partial<Record<InvitationEvent, InvitationScene>>> = {
  sealed: {OPEN: "letter"},
  letter: {CONTINUE: "gift"},
  gift: {UNWRAP: "completed"},
  completed: {REPLAY: "sealed"},
};

export function transitionInvitation(scene: InvitationScene, event: InvitationEvent): InvitationScene {
  return transitions[scene][event] ?? scene;
}

export function getInvitationStep(scene: InvitationScene): number {
  return INVITATION_SCENES.indexOf(scene) + 1;
}
