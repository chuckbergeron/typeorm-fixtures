import { ConnectionOptions, ConnectionOptionsReader, createConnection as typeOrmCC, Connection } from 'typeorm';

export async function createConnection(connectionName: string): Promise<any> {
    const cor = new ConnectionOptionsReader({
        root: process.cwd(),
    });
    const options: ConnectionOptions = await cor.get('default');
    let connection = null;
    try {
        connection = await typeOrmCC(options);
    } catch (err) {
        // console.log(err);
    }

    return connection;
}
