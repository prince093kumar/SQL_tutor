pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIAL_ID = 'dockerhub'
        DOCKER_USERNAME = 'prince093kumar'
        
        EC2_HOST = '54.172.118.6'
        EC2_USER = 'ubuntu'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIAL_ID) {
                        parallel(
                            'Client': {
                                def img = docker.build("${DOCKER_USERNAME}/sqllab-client:latest", "-f client/Dockerfile .")
                                img.push()
                            },
                            'Gateway': {
                                def img = docker.build("${DOCKER_USERNAME}/sqllab-gateway:latest", "-f gateway/Dockerfile .")
                                img.push()
                            },
                            'Auth Service': {
                                def img = docker.build("${DOCKER_USERNAME}/sqllab-auth-service:latest", "-f services/auth-service/Dockerfile .")
                                img.push()
                            },
                            'SQL Service': {
                                def img = docker.build("${DOCKER_USERNAME}/sqllab-sql-service:latest", "-f services/sql-service/Dockerfile .")
                                img.push()
                            },
                            'Challenge Service': {
                                def img = docker.build("${DOCKER_USERNAME}/sqllab-challenge-service:latest", "-f services/challenge-service/Dockerfile .")
                                img.push()
                            },
                            'Analytics Service': {
                                def img = docker.build("${DOCKER_USERNAME}/sqllab-analytics-service:latest", "-f services/analytics-service/Dockerfile .")
                                img.push()
                            }
                        )
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    // aws-key is the Jenkins SSH credential with the ubuntu user
                    sshagent(credentials: ['aws-key']) {
                        // Copy docker-compose and SQL scripts to EC2
                        sh "scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${EC2_USER}@${EC2_HOST}:~/docker-compose.yml"
                        sh "scp -r -o StrictHostKeyChecking=no docker/ ${EC2_USER}@${EC2_HOST}:~/"

                        // SSH into EC2, pull images from Docker Hub, and restart docker-compose
                        sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            
                            # Export registry prefix so docker-compose uses Docker Hub images
                            export REGISTRY_PREFIX=${DOCKER_USERNAME}/
                            
                            # Ensure network exists
                            docker network create sqllab_network || true

                            docker-compose pull
                            docker-compose up -d --remove-orphans
                        '
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Deployment Successful!"
        }
        failure {
            echo "Deployment Failed. Please check the logs."
        }
    }
}
