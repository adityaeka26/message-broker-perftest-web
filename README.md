# Message Broker Performance Test with Dashboard

A tool to calculate message broker performance. Current supported message broker: RabbitMQ, Apache Kafka.

![broker-perftest](https://adityaeka.com/broker-perftest)

## Installation

Run this command on your broker device first:
```
docker run -p 3000:3000 adityaeka26/usage-perftest:1.1
```

#### RabbitMQ

Run this command on your producer device:
```
docker run -p 3000:3000 adityaeka26/rabbitmq-perftest-web:1.2
```

#### Kafka

Run this command on your producer device:
```
docker run -p 4000:4000 adityaeka26/kafka-perftest-web:1.0
```