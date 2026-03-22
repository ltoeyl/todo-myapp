pipeline {
    agent any

    environment {
        APP_NAME    = 'myapp-todo'
        IMAGE_NAME  = 'myapp-todo'
        IMAGE_TAG   = "${env.BUILD_NUMBER}"
        APP_PORT    = '3000'
        NODE_PORT   = '30080'
        NAMESPACE   = 'default'
        ANSIBLE_DIR = '/var/lib/jenkins/ansible-lab'
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-ssh-key',
                    url: 'git@github.com:ltoeyl/myapp.git'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy via Ansible') {
            steps {
                ansiblePlaybook(
                    playbook:  "${ANSIBLE_DIR}/playbooks/deploy.yml",
                    inventory: "${ANSIBLE_DIR}/inventory/hosts.ini",
                    extras: "-e app_name=${APP_NAME} -e image_name=${IMAGE_NAME} -e image_tag=${IMAGE_TAG} -e app_port=${APP_PORT} -e node_port=${NODE_PORT}"
                )
            }
        }

        stage('Smoke Test') {
            steps {
                // Wait for pod to be ready, then hit the health endpoint
                sh 'sleep 10'
                sh "curl -f http://159.223.64.228:${NODE_PORT}/health || exit 1"
                echo "App is healthy at http://159.223.64.228:${NODE_PORT}"
            }
        }
    }

    post {
        success { echo "DEPLOYED: http://159.223.64.228:30080" }
        failure { echo "FAILED – see Console Output" }
    }
}
