import path from 'path'
import { DockerComposeEnvironment, StartedDockerComposeEnvironment } from 'testcontainers'

let instance: StartedDockerComposeEnvironment | null = null

export const startDocker = async () => {
    const composeFilePath = path.resolve(__dirname) 
    const composeFile = 'docker-compose.yml'
    instance = await new DockerComposeEnvironment(composeFilePath, composeFile).up()
    console.log('✅ Docker compose instance is running');
}

export const stopDocker = async () => {
    if(!instance) return;

    try {
        await instance.down()
        instance = null
    } catch (error) {
        console.log('❌ Something wrong', error);
        
    }
}
