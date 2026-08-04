pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
    }

    environment {
        DOCKERHUB_CREDENTIAL_ID = 'dockerhub'
        DOCKER_USERNAME = 'prince093kumar'

        EC2_HOST = '54.172.118.6'
        EC2_USER = 'ubuntu'
        SSH_CREDENTIAL_ID = 'aws_sql'

        REGISTRY = 'docker.io'
    }

    stages {

       
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

       
        stage('Verify Environment') {
            steps {
                bat '''
                    echo ===== Docker =====
                    docker --version

                    echo ===== Docker Compose =====
                    docker compose version

                    echo ===== Git =====
                    git --version

                    echo ===== SSH =====
                    ssh -V
                '''
            }
        }

       
        stage('Docker Hub Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKERHUB_CREDENTIAL_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                    '''
                }
            }
        }

        

        stage('Build Client') {
            steps {
                retry(2) {
                    bat '''
                        docker build ^
                        --network=default ^
                        -t %DOCKER_USERNAME%/sqllab-client:latest ^
                        -f client/Dockerfile .
                    '''
                }
            }
        }

        stage('Build Gateway') {
            steps {
                retry(2) {
                    bat '''
                        docker build ^
                        --network=default ^
                        -t %DOCKER_USERNAME%/sqllab-gateway:latest ^
                        -f gateway/Dockerfile .
                    '''
                }
            }
        }

        stage('Build Auth Service') {
            steps {
                retry(2) {
                    bat '''
                        docker build ^
                        --network=default ^
                        -t %DOCKER_USERNAME%/sqllab-auth-service:latest ^
                        -f services/auth-service/Dockerfile .
                    '''
                }
            }
        }

        stage('Build SQL Service') {
            steps {
                retry(2) {
                    bat '''
                        docker build ^
                        --network=default ^
                        -t %DOCKER_USERNAME%/sqllab-sql-service:latest ^
                        -f services/sql-service/Dockerfile .
                    '''
                }
            }
        }

        stage('Build Challenge Service') {
            steps {
                retry(2) {
                    bat '''
                        docker build ^
                        --network=default ^
                        -t %DOCKER_USERNAME%/sqllab-challenge-service:latest ^
                        -f services/challenge-service/Dockerfile .
                    '''
                }
            }
        }

        stage('Build Analytics Service') {
            steps {
                retry(2) {
                    bat '''
                        docker build ^
                        --network=default ^
                        -t %DOCKER_USERNAME%/sqllab-analytics-service:latest ^
                        -f services/analytics-service/Dockerfile .
                    '''
                }
            }
        }

       
        stage('Push Images') {
            steps {
                bat '''
                    docker push %DOCKER_USERNAME%/sqllab-client:latest
                    docker push %DOCKER_USERNAME%/sqllab-gateway:latest
                    docker push %DOCKER_USERNAME%/sqllab-auth-service:latest
                    docker push %DOCKER_USERNAME%/sqllab-sql-service:latest
                    docker push %DOCKER_USERNAME%/sqllab-challenge-service:latest
                    docker push %DOCKER_USERNAME%/sqllab-analytics-service:latest
                '''
            }
        }

       
        stage('Test EC2 Connection') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_CREDENTIAL_ID}",
                        keyFileVariable: 'EC2_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    bat '''
                        for /f "delims=" %%i in ('whoami') do icacls "%EC2_KEY%" /inheritance:r /grant:r "%%i":"(R)"
                        ssh -o StrictHostKeyChecking=no ^
                        -i "%EC2_KEY%" ^
                        %SSH_USER%@%EC2_HOST% ^
                        "echo Jenkins connected successfully && hostname && docker --version && docker compose version"
                    '''
                }
            }
        }

       
        stage('Copy Deployment Files') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_CREDENTIAL_ID}",
                        keyFileVariable: 'EC2_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {

                    bat '''
                        for /f "delims=" %%i in ('whoami') do icacls "%EC2_KEY%" /inheritance:r /grant:r "%%i":"(R)"
                        ssh -o StrictHostKeyChecking=no ^
                        -i "%EC2_KEY%" ^
                        %SSH_USER%@%EC2_HOST% ^
                        "sudo mkdir -p /opt/sqllab && sudo chown -R %SSH_USER%:%SSH_USER% /opt/sqllab"
                    '''

                    bat '''
                        scp -o StrictHostKeyChecking=no ^
                        -i "%EC2_KEY%" ^
                        docker-compose.prod.yml ^
                        %SSH_USER%@%EC2_HOST%:/opt/sqllab/docker-compose.yml
                    '''

                    bat '''
                        scp -r ^
                        -o StrictHostKeyChecking=no ^
                        -i "%EC2_KEY%" ^
                        docker ^
                        %SSH_USER%@%EC2_HOST%:/opt/sqllab/
                    '''
                }
            }
        }

       
        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_CREDENTIAL_ID}",
                        keyFileVariable: 'EC2_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {

                    bat '''
                        for /f "delims=" %%i in ('whoami') do icacls "%EC2_KEY%" /inheritance:r /grant:r "%%i":"(R)"
                        ssh -o StrictHostKeyChecking=no ^
                        -i "%EC2_KEY%" ^
                        %SSH_USER%@%EC2_HOST% ^
                        "cd /opt/sqllab && REGISTRY_PREFIX=%DOCKER_USERNAME%/ docker compose pull && REGISTRY_PREFIX=%DOCKER_USERNAME%/ docker compose up -d --remove-orphans"
                    '''
                }
            }
        }

        /*
         * =====================================================
         * 8. VERIFY DEPLOYMENT
         * =====================================================
         */
        stage('Verify Deployment') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${SSH_CREDENTIAL_ID}",
                        keyFileVariable: 'EC2_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {

                    bat '''
                        for /f "delims=" %%i in ('whoami') do icacls "%EC2_KEY%" /inheritance:r /grant:r "%%i":"(R)"
                        ssh -o StrictHostKeyChecking=no ^
                        -i "%EC2_KEY%" ^
                        %SSH_USER%@%EC2_HOST% ^
                        "cd /opt/sqllab && docker compose ps"
                    '''
                }
            }
        }
    }

    post {

        success {
            echo '========================================'
            echo 'SQLLab deployment successful!'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'SQLLab deployment failed.'
            echo 'Check the failed Jenkins stage.'
            echo '========================================'
        }

        cleanup {
            bat '''
                docker logout
            '''

            cleanWs()
        }
    }
}
