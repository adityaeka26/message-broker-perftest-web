# Message Broker Performance Test Tool

A tool to calculate message broker performance. Current supported message broker: RabbitMQ, Apache Kafka. To run this performance test tool, you must install Docker or you can manually build it.

![broker-perftest](https://adityaeka.com/broker-perftest.jpg)

## Installation

Run this command on your broker device first:
```
docker run -p 3000:3000 adityaeka26/usage-perftest:1.2
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
