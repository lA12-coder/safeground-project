'use client';

type RevokeGuardianModalProps = {
  alias: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  revoking: boolean;
};

export function RevokeGuardianModal({
  alias,
  open,
  onClose,
  onConfirm,
  revoking,
}: RevokeGuardianModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="card p-8 max-w-md w-full space-y-6" role="dialog" aria-modal="true">
        <h2 className="font-serif text-xl font-bold text-on-surface">Revoke access?</h2>
        <p className="body-md text-sm">
          <strong>{alias}</strong> will no longer receive alerts or summaries. You can create a new
          link later.
        </p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-on-surface-variant">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={revoking}
            className="px-5 py-2 rounded-full bg-error text-on-error font-semibold disabled:opacity-60"
          >
            {revoking ? 'Revoking…' : 'Revoke Access'}
          </button>
        </div>
      </div>
    </div>
  );
}
