import { GIT_EXIT_CODES } from './constants.js';
import { GitContext, PushFailureScenario, PushFailureType, PushResolutionOption } from './types.js';

interface ScenarioTemplate {
	type: PushFailureType;
	patterns: RegExp[];
	headline: (context: GitContext) => string;
	details: (context: GitContext, message: string) => string;
	options: (context: GitContext) => PushResolutionOption[];
}

const ansiPattern = /\u001b\[[0-9;]*m/g;

const templates: ScenarioTemplate[] = [
	{
		type: 'NO_UPSTREAM',
		patterns: [
			/no upstream branch/i,
			/no configured push destination/i,
			/set-upstream/i,
			/upstream branch of your current branch does not match/i
		],
		headline: (context: GitContext): string =>
			`No upstream branch configured for ${context.currentBranch || 'this branch'}`,
		details: (_context: GitContext, _message: string): string =>
			'Git could not find a remote tracking branch. You need to push with --set-upstream the first time.',
		options: (context: GitContext): PushResolutionOption[] => [
			{
				label: `Create upstream on origin/${context.currentBranch || '<branch>'}`,
				value: 'setUpstream',
				hint: 'Runs git push -u origin <branch>'
			},
			{
				label: 'Abort push for now',
				value: 'abort'
			}
		]
	},
	{
		type: 'NON_FAST_FORWARD',
		patterns: [
			/non-fast-forward/i,
			/fetch first/i,
			/failed to push some refs/i,
			/remote contains work that you do not have/i,
			/tip of your current branch is behind/i
		],
		headline: (context: GitContext): string =>
			`Remote has commits ahead of ${context.currentBranch || 'your branch'}`,
		details: (_context: GitContext, _message: string): string =>
			'Pull the latest changes, resolve conflicts if any, and try pushing again.',
		options: (context: GitContext): PushResolutionOption[] => [
			{
				label: 'Pull with rebase then retry push',
				value: 'pullWithRebase',
				hint: 'Runs git pull --rebase origin <branch>'
			},
			{
				label: 'Pull with merge then retry push',
				value: 'pullWithMerge',
				hint: 'Runs git pull origin <branch>'
			},
			{
				label: 'Abort push for now',
				value: 'abort'
			}
		]
	},
	{
		type: 'AUTHENTICATION',
		patterns: [
			/authentication failed/i,
			/permission denied/i,
			/could not read username/i,
			/support for password authentication was removed/i,
			/fatal: unable to access/i
		],
		headline: (_context: GitContext): string => 'Authentication failed while contacting remote',
		details: (_context: GitContext, _message: string): string =>
			'Update your credentials or authentication token, then retry the push.',
		options: (_context: GitContext): PushResolutionOption[] => [
			{
				label: 'Retry push',
				value: 'retryPush'
			},
			{
				label: 'Abort push for now',
				value: 'abort'
			}
		]
	},
	{
		type: 'NETWORK',
		patterns: [
			/could not resolve host/i,
			/failed to connect/i,
			/network is unreachable/i,
			/timed out/i,
			/temporarily unavailable/i
		],
		headline: (_context: GitContext): string => 'Network issue while pushing changes',
		details: (_context: GitContext, _message: string): string => 'Check your connection and try again.',
		options: (_context: GitContext): PushResolutionOption[] => [
			{
				label: 'Retry push',
				value: 'retryPush'
			},
			{
				label: 'Abort push for now',
				value: 'abort'
			}
		]
	}
];

const buildGenericScenario = (message: string): PushFailureScenario => ({
	type: 'GENERIC',
	headline: 'Push failed',
	details: 'gitquick can retry the push or you can stop here and resolve it manually.',
	options: [
		{ label: 'Retry push', value: 'retryPush' },
		{ label: 'Abort push for now', value: 'abort' }
	],
	rawMessage: message
});

const sanitizeMessage = (error: any): string => {
	const segments = [error?.all, error?.stderr, error?.message];
	for (const segment of segments) {
		if (segment && typeof segment === 'string' && segment.trim()) {
			return segment.replace(ansiPattern, '').trim();
		}
	}
	return 'Unknown git error';
};

const isUpstreamExitCode = (error: any): boolean => error?.exitCode === GIT_EXIT_CODES.UPSTREAM_NOT_SET;

const matchTemplate = (message: string): ScenarioTemplate | undefined => {
	return templates.find(template => template.patterns.some(pattern => pattern.test(message)));
};

export const determinePushFailureScenario = (error: any, context: GitContext): PushFailureScenario => {
	const message = sanitizeMessage(error);
	if (isUpstreamExitCode(error)) {
		const upstreamTemplate = templates.find(template => template.type === 'NO_UPSTREAM');
		if (upstreamTemplate) {
			return {
				type: upstreamTemplate.type,
				headline: upstreamTemplate.headline(context),
				details: upstreamTemplate.details(context, message),
				options: upstreamTemplate.options(context),
				rawMessage: message
			};
		}
	}

	const template = matchTemplate(message);
	if (template) {
		return {
			type: template.type,
			headline: template.headline(context),
			details: template.details(context, message),
			options: template.options(context),
			rawMessage: message
		};
	}

	return buildGenericScenario(message);
};
