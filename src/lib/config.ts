import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { yellow, bold, white } from 'colorette';
import { GitCliPreference, GitQuickProjectConfig } from './types.js';

const CONFIG_FILE_NAME = 'gitquick.config.json';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../../', CONFIG_FILE_NAME);

const resolveConfigPath = (): string => {
	const customPath = process.env.GITQUICK_CONFIG_PATH;
	if (customPath && customPath.trim().length > 0) {
		return path.resolve(customPath);
	}
	return DEFAULT_CONFIG_PATH;
};

const isValidGitCliValue = (value: unknown): value is GitCliPreference => {
	return value === null || value === 'None' || value === 'GitHub' || value === 'GitLab';
};

const sanitizeEntries = (rawEntries: any[]): GitQuickProjectConfig[] => {
	return rawEntries
		.filter(entry => entry && typeof entry.projectName === 'string')
		.map(entry => ({
			projectName: entry.projectName,
			gitCli: isValidGitCliValue(entry.gitCli) ? entry.gitCli : null
		}));
};

const logConfigWarning = (message: string): void => {
	console.warn(yellow(bold('WARNING! ')) + white(message));
};

const readConfigFile = async (): Promise<GitQuickProjectConfig[] | null> => {
	try {
		const fileContents = await fs.readFile(resolveConfigPath(), 'utf-8');
		if (!fileContents.trim()) {
			return [];
		}
		const parsed = JSON.parse(fileContents);
		if (!Array.isArray(parsed)) {
			throw new Error('Config must contain an array of project entries.');
		}
		return sanitizeEntries(parsed);
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			return null;
		}
		logConfigWarning('gitquick.config.json is unreadable. Restoring an empty config.');
		return [];
	}
};

const writeConfigFile = async (entries: GitQuickProjectConfig[]): Promise<void> => {
	await fs.writeFile(resolveConfigPath(), JSON.stringify(entries, null, 2) + '\n', 'utf-8');
};

const ensureConfigFileInitialized = async (): Promise<GitQuickProjectConfig[]> => {
	const config = await readConfigFile();
	if (config === null) {
		await writeConfigFile([]);
		return [];
	}
	return config;
};

const getCurrentProjectName = (cwd: string = process.cwd()): string => {
	const normalizedPath = cwd.trim().length > 0 ? cwd : process.cwd();
	const basename = path.basename(normalizedPath);
	return basename || normalizedPath || 'unknown-project';
};

const ensureProjectEntry = async (projectName: string): Promise<GitQuickProjectConfig> => {
	const normalizedName = projectName.trim() || 'unknown-project';
	const config = await ensureConfigFileInitialized();
	let project = config.find(entry => entry.projectName === normalizedName);
	if (!project) {
		project = { projectName: normalizedName, gitCli: null };
		config.push(project);
		await writeConfigFile(config);
	}
	return project;
};

const updateProjectGitCli = async (projectName: string, gitCli: GitCliPreference): Promise<GitQuickProjectConfig> => {
	const normalizedName = projectName.trim() || 'unknown-project';
	const config = await ensureConfigFileInitialized();
	const index = config.findIndex(entry => entry.projectName === normalizedName);
	if (index === -1) {
		const newEntry: GitQuickProjectConfig = { projectName: normalizedName, gitCli };
		config.push(newEntry);
		await writeConfigFile(config);
		return newEntry;
	}
	const updatedEntry: GitQuickProjectConfig = { ...config[index], gitCli };
	config[index] = updatedEntry;
	await writeConfigFile(config);
	return updatedEntry;
};

const printConfigFile = async (logger: (message: string) => void = console.log): Promise<void> => {
	const config = await ensureConfigFileInitialized();
	if (config.length === 0) {
		logger('No projects currently in the gitquick config.');
		return;
	}
	logger(JSON.stringify(config, null, 2));
};

const isInteractiveEnvironment = (): boolean => {
	return Boolean(process.stdin.isTTY && process.stdout.isTTY && !process.env.CI);
};

export {
	CONFIG_FILE_NAME,
	ensureConfigFileInitialized,
	ensureProjectEntry,
	getCurrentProjectName,
	isInteractiveEnvironment,
	printConfigFile,
	updateProjectGitCli
};