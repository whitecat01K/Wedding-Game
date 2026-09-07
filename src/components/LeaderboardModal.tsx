import React, { useState } from 'react';
import { QuizResultData } from '../types';
import { Trophy, Clock, X, Trash2, Users, Search, RefreshCw, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { clearAllLeaderboard, groupLeaderboardByTable, WEDDING_TABLES } from '../utils/quizScoring';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: QuizResultData[];
  onRefresh: () => void;
  currentResultId?: string;
}

export function LeaderboardModal({
  isOpen,
  onClose,
  leaderboard,
  onRefresh,
  currentResultId
}: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<'tables' | 'individuals'>('tables');
  const [tableSortBy, setTableSortBy] = useState<'table' | 'score'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    '主桌 👑': true,
    '第 2 桌': true,
    '第 3 桌': true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 保持 onRefresh 引用穩定，避免重新渲染引發畫面跳動
  const onRefreshRef = React.useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // 當開啟排行榜時平順更新資料，背景間隔溫和輪詢，絕不引起視覺跳動
  React.useEffect(() => {
    if (!isOpen) return;
    onRefreshRef.current();
    const interval = setInterval(() => {
      onRefreshRef.current();
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClear = async () => {
    if (
      window.confirm(
        '確定要清空現場所有親友的成績排行嗎？\n\n此動作將一併清除伺服器上的紀錄，適合在婚禮開場前將測試成績歸零！'
      )
    ) {
      await clearAllLeaderboard();
      onRefresh();
    }
  };

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  // Group by table (no champion badges, clean table records)
  const tableGroups = groupLeaderboardByTable(leaderboard, tableSortBy);

  // Filter table groups by search query
  const filteredTableGroups = tableGroups.filter((g) =>
    g.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.members.some((m) => m.playerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter individual leaderboard by search query
  const filteredIndividuals = leaderboard.filter(
    (item) =>
      item.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tableNumber && item.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-3.5 sm:p-6 shadow-2xl border-2 border-pink-200 relative text-stone-800 max-h-[88vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-3 shrink-0 pr-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black mb-1 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>📊 已即時連線 Google 試算表</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
            現場親友各桌戰績 ＆ 排行榜 👑
          </h3>
          <p className="text-[11px] text-stone-500 font-medium">
            雲端試算表自動同步 · 紀錄各桌人員成績
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-pink-100/60 rounded-2xl mb-2.5 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`py-2 px-2 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-white text-[#FF3366] shadow-2xs border border-pink-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>🪑 各桌紀錄 ({tableGroups.length} 桌)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('individuals')}
            className={`py-2 px-2 rounded-xl font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'individuals'
                ? 'bg-white text-[#FF3366] shadow-2xs border border-pink-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>👤 個人風雲榜 ({leaderboard.length} 人)</span>
          </button>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'tables' ? '搜尋桌號或姓名...' : '搜尋姓名或桌號...'}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#FF3366]"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
          </div>

          {/* Table Sort Method (Only for Tables tab) */}
          {activeTab === 'tables' && (
            <div className="flex items-center bg-white p-0.5 rounded-xl border border-stone-200 text-[11px] font-bold shrink-0">
              <button
                onClick={() => setTableSortBy('table')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  tableSortBy === 'table'
                    ? 'bg-[#FF3366] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                依桌次
              </button>
              <button
                onClick={() => setTableSortBy('score')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  tableSortBy === 'score'
                    ? 'bg-[#FFA000] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                依高分
              </button>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-black flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
            title="即時拉取最新戰況"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FF3366] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-0.5">
          {/* TAB 1: TABLE GROUP RECORDS (No champion/runner-up badges, just clean table record) */}
          {activeTab === 'tables' && (
            <>
              {filteredTableGroups.length === 0 ? (
                <div className="text-center py-10 text-stone-400 font-bold text-xs bg-white rounded-2xl border border-stone-200">
                  {searchQuery ? '查無符合的桌次紀錄' : '目前尚無桌次成績，快來成為該桌第一位作答的親友！'}
                </div>
              ) : (
                filteredTableGroups.map((group) => {
                  const isExpanded = !!expandedTables[group.tableName];
                  const hasCurrentUser = group.members.some((m) => m.id === currentResultId);

                  return (
                    <div
                      key={group.tableName}
                      className={`rounded-2xl border-2 transition-all overflow-hidden bg-white ${
                        hasCurrentUser
                          ? 'border-[#FF3366] ring-2 ring-pink-100 shadow-xs'
                          : 'border-stone-200 shadow-2xs'
                      }`}
                    >
                      {/* Table Header Card (Tap to toggle members) */}
                      <div
                        onClick={() => toggleTableExpand(group.tableName)}
                        className="p-3 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-stone-50/80 transition-colors select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Table Badge */}
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-50 to-pink-50 border border-pink-200 text-stone-800 flex items-center justify-center font-black text-xs shrink-0">
                            🪑
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-black text-stone-900 text-sm truncate">
                                {group.tableName}
                              </h4>
                              {hasCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded bg-[#FF3366] text-white text-[9px] font-black shrink-0">
                                  您的桌次
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-stone-500 font-bold flex items-center gap-1.5 mt-0.5 truncate">
                              <span>最高分：{group.topPlayerAvatar} {group.topPlayerName}</span>
                              <span>•</span>
                              <span>{group.memberCount} 人作答</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-black text-[#FF3366] font-mono leading-tight">
                              {group.highestScore.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-stone-400 font-bold">
                              該桌最高分
                            </div>
                          </div>

                          <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Member List for this Table */}
                      {isExpanded && (
                        <div className="bg-stone-50/90 p-2.5 pt-1 border-t border-stone-200/80 space-y-1">
                          <div className="text-[10px] font-black text-stone-500 px-1 mb-0.5">
                            📋 {group.tableName} 成員分數名單：
                          </div>

                          {group.members.map((member, mIdx) => {
                            const isUser = member.id === currentResultId;
                            return (
                              <div
                                key={member.id || mIdx}
                                className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                  isUser
                                    ? 'bg-pink-100/90 border-[#FF3366]'
                                    : mIdx === 0
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-white border-stone-200'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`w-4 h-4 rounded text-[9px] flex items-center justify-center font-black ${
                                    mIdx === 0 ? 'bg-amber-400 text-amber-950' : 'bg-stone-200 text-stone-700'
                                  }`}>
                                    {mIdx + 1}
                                  </span>
                                  <span className="text-sm shrink-0">{member.playerAvatar}</span>
                                  <span className="font-black text-stone-800 truncate">
                                    {member.playerName}
                                  </span>
                                  {isUser && (
                                    <span className="px-1 py-0.2 rounded bg-[#FF3366] text-white text-[8px] font-black shrink-0">
                                      您
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-right font-mono shrink-0">
                                  <span className="text-[9px] text-stone-400">
                                    {member.correctCount}/10 題 ({member.totalTimeSpent}s)
                                  </span>
                                  <span className="font-black text-[#FF3366] text-xs">
                                    {member.finalScore.toLocaleString()}分
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: INDIVIDUAL LEADERBOARD */}
          {activeTab === 'individuals' && (
            <>
              {filteredIndividuals.length === 0 ? (
                <div className="text-center py-10 text-stone-400 font-bold text-xs bg-white rounded-2xl border border-stone-200">
                  {searchQuery ? '查無符合的親友紀錄' : '目前尚無親友紀錄'}
                </div>
              ) : (
                filteredIndividuals.map((item, idx) => {
                  const rank = idx + 1;
                  const isCurrent = currentResultId === item.id;

                  return (
                    <div
                      key={item.id || idx}
                      className={`p-2.5 rounded-2xl border-2 flex items-center justify-between gap-2 transition-all ${
                        isCurrent
                          ? 'bg-pink-50/80 border-[#FF3366] shadow-2xs'
                          : rank === 1
                          ? 'bg-gradient-to-r from-amber-50/80 to-white border-amber-300'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-amber-950 shadow-2xs'
                            : rank === 2
                            ? 'bg-rose-300 text-rose-950'
                            : rank === 3
                            ? 'bg-orange-300 text-orange-950'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {rank}
                        </span>

                        <span className="text-xl shrink-0">{item.playerAvatar}</span>

                        <div className="min-w-0">
                          <div className="font-black text-stone-900 text-xs flex items-center gap-1 truncate">
                            <span className="truncate">{item.playerName}</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-black shrink-0">
                              {item.tableNumber}
                            </span>
                            {isCurrent && (
                              <span className="px-1 py-0.2 rounded bg-[#FF3366] text-white text-[8px] font-black shrink-0">
                                您
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400 font-bold flex items-center gap-1.5 mt-0.5">
                            <span>答對 {item.correctCount}/10 題</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 font-mono">
                              <Clock className="w-2.5 h-2.5 text-stone-400" />
                              {item.totalTimeSpent}s
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-[#FF3366] font-mono">
                          {item.finalScore.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-stone-400 font-bold">
                          總得分
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-3 pt-2.5 border-t border-pink-100 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[10px] text-stone-500 font-medium">
            💡 試算表刪除資料列即可同步（Google 伺服器約需 1~2 分鐘更新發布）
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-bold cursor-pointer transition-colors"
              title="清空本機快取與伺服器紀錄"
            >
              🧹 歸零清空
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#FFA000] text-white text-xs font-black shadow-xs hover:brightness-105 cursor-pointer shrink-0"
            >
              關閉視窗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
