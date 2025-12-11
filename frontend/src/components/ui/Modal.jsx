import { IoBackspaceOutline } from 'react-icons/io5';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  isLoading = false,
  disableClose = false,
  widthClass = 'w-80',
}) {
  if (!open) return null;
  const canClose = !disableClose && !isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={canClose ? onClose : undefined} />
      <div className={`relative bg-white text-gray-900 ${widthClass} rounded-md shadow-lg p-6`} onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <button
          onClick={canClose ? onClose : undefined}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
          aria-label="닫기"
          disabled={!canClose}
        >
          <IoBackspaceOutline />
        </button>
        {children}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  );
}
