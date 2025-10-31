export type LangDict = Record<string, string>;

export const dict: Record<'en' | 'zh', LangDict> = {
  en: {
    app_title: 'Dynamic Blueprint',
    welcome_title: 'Welcome back, User',
    welcome_sub: 'Ready to shape your future?',
    start_goal: 'Start a New Goal',
    start_goal_desc: 'Define your next ambition and create a clear path forward.',
    resume_session: 'Resume Session',
    resume_session_desc: 'Continue defining your current project.',
    review_sessions: 'Review Past Sessions',
    review_sessions_desc: 'Reflect on your journey and insights.',
    dialog_resume_title: 'Resume a Session',
    dialog_review_title: 'Past Sessions',
    dialog_empty: 'No sessions found.',
    open: 'Open',
    close: 'Close',
    language: 'Language',
  },
  zh: {
    app_title: 'Dynamic Blueprint',
    welcome_title: '欢迎回来，用户',
    welcome_sub: '准备好塑造你的未来了吗？',
    start_goal: '开始新的目标',
    start_goal_desc: '定义你的下一步抱负并创建清晰路径。',
    resume_session: '继续会话',
    resume_session_desc: '继续当前项目。',
    review_sessions: '回顾历史会话',
    review_sessions_desc: '回顾你的旅程和洞见。',
    dialog_resume_title: '恢复会话',
    dialog_review_title: '历史会话',
    dialog_empty: '暂无会话。',
    open: '打开',
    close: '关闭',
    language: '语言',
  },
};

export function t(lang: 'en' | 'zh', key: string) {
  return dict[lang][key] ?? key;
}


