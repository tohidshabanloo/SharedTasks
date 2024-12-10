import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const filePath = path.join(process.cwd(), 'data', 'tasks.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const tasks = JSON.parse(fileContents);

    res.status(200).json(tasks);
}
