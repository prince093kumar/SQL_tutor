pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        
        EC2_HOST = '54.172.118.6'
        EC2_USER = 'ubuntu'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('AWS ECR Login') {
            steps {
                script {
                    // Requires Jenkins AWS Credentials Plugin and AWS CLI installed on the Jenkins agent
                    withAWS(credentials: 'aws-credentials', region: "${AWS_REGION}") {
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    }
                }
            }
        }

        stage('Build & Push Images') {
            parallel {
                stage('Client') {
                    steps {
                        script {
                            def img = docker.build("${ECR_REGISTRY}/sqllab-client:latest", "-f client/Dockerfile .")
                            img.push()
                        }
                    }
                }
                stage('Gateway') {
                    steps {
                        script {
                            def img = docker.build("${ECR_REGISTRY}/sqllab-gateway:latest", "-f gateway/Dockerfile .")
                            img.push()
                        }
                    }
                }
                stage('Auth Service') {
                    steps {
                        script {
                            def img = docker.build("${ECR_REGISTRY}/sqllab-auth-service:latest", "-f services/auth-service/Dockerfile .")
                            img.push()
                        }
                    }
                }
                stage('SQL Service') {
                    steps {
                        script {
                            def img = docker.build("${ECR_REGISTRY}/sqllab-sql-service:latest", "-f services/sql-service/Dockerfile .")
                            img.push()
                        }
                    }
                }
                stage('Challenge Service') {
                    steps {
                        script {
                            def img = docker.build("${ECR_REGISTRY}/sqllab-challenge-service:latest", "-f services/challenge-service/Dockerfile .")
                            img.push()
                        }
                    }
                }
                stage('Analytics Service') {
                    steps {
                        script {
                            def img = docker.build("${ECR_REGISTRY}/sqllab-analytics-service:latest", "-f services/analytics-service/Dockerfile .")
                            img.push()
                        }
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    sshagent(credentials: ['ec2-ssh-key']) {
                        // Copy docker-compose and SQL scripts to EC2
                        sh "scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${EC2_USER}@${EC2_HOST}:~/docker-compose.yml"
                        sh "scp -r -o StrictHostKeyChecking=no docker/ ${EC2_USER}@${EC2_HOST}:~/"

                        // SSH into EC2, login to ECR, pull images, and restart docker-compose
                        sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                            
                            # Export registry prefix so docker-compose uses ECR images
                            export ECR_REGISTRY=${ECR_REGISTRY}/
                            
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
