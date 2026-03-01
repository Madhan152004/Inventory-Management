pipeline {
    agent any

    parameters {
        string(name: 'ImageTag', defaultValue: "${BUILD_NUMBER}", description: 'Docker Image Tag')
    }

    environment {
        SONAR_HOME = tool 'sonar-scanner'   # tool name defined in Jenkins for SonarQube Scanner, returns the path to the tool
        DOCKER_CREDS = credentials('dockerhub-username')
        DOCKER_USER = "${DOCKER_CREDS_USR}"

        FRONTEND_IMAGE = "${DOCKER_USER}/frontend"
        BACKEND_IMAGE  = "${DOCKER_USER}/backend"

        GIT_BRANCH = "main"
    }

    stages {

        stage("Git Checkout") {
            steps {
                git branch: "${GIT_BRANCH}",
                    url: "https://github.com/Madhan152004/Inventory-Management.git",
                    credentialsId: "github-cred"
            }
        }

        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv("sonar-server") {
                    sh """
                    ${SONAR_HOME}/bin/sonar-scanner \    # path to sonar-scanner executable
                    -Dsonar.projectKey=Inventory-Management \    # unique key for the project in SonarQube
                    -Dsonar.projectName=Inventory-Management \    # human-readable name for the project in SonarQube
                    -Dsonar.sources=Backend,Frontend/inventory_management_system \  # directories to analyze
                    -Dsonar.exclusions=**/node_modules/**,**/k8s/**,**/*.yml    # exclude dependencies and Kubernetes manifests from analysis
                    """
                }
            }
        }

        stage("Quality Gate") {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true   # if the quality gate fails, the pipeline will be aborted
                }
            }
        }

        stage("OWASP Dependency Check") {
            steps {
                dependencyCheck additionalArguments: '''
                    --scan Backend \
                    --scan Frontend/inventory_management_system \
                    --failOnCVSS 7 \
                    --format XML
                ''',
                odcInstallation: 'owasp'

                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'  # publish the generated report in Jenkins UI
            }
        }

        stage("Docker Build") {
            parallel {

                stage("Frontend Image Build") {
                    steps {
                        sh """
                        docker build \
                        -t ${FRONTEND_IMAGE}:${params.ImageTag} \
                        Frontend/inventory_management_system
                        """
                    }
                }

                stage("Backend Image Build") {
                    steps {
                        sh """
                        docker build \
                        -t ${BACKEND_IMAGE}:${params.ImageTag} \
                        Backend
                        """
                    }
                }
            }
        }

        stage("Trivy Image Scan") {
            parallel {

                stage("Frontend Scan") {
                    steps {
                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        ${FRONTEND_IMAGE}:${params.ImageTag}
                        """
                    }
                }

                stage("Backend Scan") {
                    steps {
                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        ${BACKEND_IMAGE}:${params.ImageTag}
                        """
                    }
                }
            }
        }

        stage("Push Images") {
            steps {
                withDockerRegistry([credentialsId: 'dockerhub-username', url: '']) {
                    sh """
                    docker push ${FRONTEND_IMAGE}:${params.ImageTag}
                    docker push ${BACKEND_IMAGE}:${params.ImageTag}
                    """
                }
            }
        }

        stage("Update K8s Manifests for ArgoCD") {
            steps {
                sh """
                yq -i ".spec.template.spec.containers[0].image = \\"${FRONTEND_IMAGE}:${params.ImageTag}\\"" \
                k8s/Frontend/deployment.yml

                yq -i ".spec.template.spec.containers[0].image = \\"${BACKEND_IMAGE}:${params.ImageTag}\\"" \
                k8s/Backend/deployment.yml
                """
            }
        }
    }
}