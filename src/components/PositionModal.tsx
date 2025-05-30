import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { usePositionPlan } from '../hooks/usePositionPlan';
import { Portfolio, Position } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Position>) => void;
  portfolio: Portfolio;
  position?: Position;
}

export const PositionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  portfolio,
  position
}) => {
  const [quantity, setQuantity] = useState(position?.quantity || 0);
  const [targetQuantity, setTargetQuantity] = useState(position?.quantity || 0);

  const plan = usePositionPlan(portfolio, {
    id: position?.id || 0,
    portfolioId: portfolio.id,
    symbol: position?.symbol || '',
    name: position?.name || '',
    quantity: quantity,
    avgPrice: position?.avgPrice || 0,
    currentPrice: position?.currentPrice || 0,
    tradeDate: position?.tradeDate || Date.now(),
    strategyCategory: position?.strategyCategory || 'UNCATEGORIZED',
    strategyTags: position?.strategyTags || []
  });

  const handleSubmit = () => {
    onSubmit({
      ...position,
      quantity: Number(quantity),
      targetQuantity: Number(targetQuantity)
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  {position ? '포지션 수정' : '새 포지션'}
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      현재 수량
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      목표 수량
                    </label>
                    <input
                      type="number"
                      value={targetQuantity}
                      onChange={(e) => setTargetQuantity(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={quantity}
                      step="1"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">투자 계획</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">현재 투자금</label>
                        <div className="text-lg">
                          ₩{plan.currentInvestment.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">최대 투자 가능</label>
                        <div className="text-lg">
                          ₩{plan.maxInvestment.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">남은 투자 가능</label>
                        <div className="text-lg">
                          ₩{plan.remainingInvestment.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">최대 수량</label>
                        <div className="text-lg">
                          {plan.maxQuantity}주
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">목표 수량</label>
                        <div className="text-lg">
                          {plan.targetQuantity}주
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">다음 매수 수량</label>
                        <div className="text-lg">
                          {plan.nextEntryQuantity}주
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 text-gray-400 hover:text-gray-300"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 