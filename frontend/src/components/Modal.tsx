import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { ReactNode } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	actionText?: string;
	onAction?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actionText = "Close", onAction }) => {
	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			{/* Overlay */}
			<DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity dark:bg-gray-900/50" />

			{/* Modal panel */}
			<div className="fixed inset-0 flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10">
					{/* Title */}
					<DialogTitle as="h3" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						{title}
					</DialogTitle>

					{/* Content */}
					<div className="mb-4">{children}</div>

					{/* Action button */}
					<div className="mt-4 sm:mt-6">
						<button
							type="button"
							onClick={onAction ? onAction : onClose}
							className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
						>
							{actionText}
						</button>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
};

export default Modal;