-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: ferreteria_taluzka
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alerta`
--

DROP TABLE IF EXISTS `alerta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerta` (
  `id_alerta` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_control` int NOT NULL,
  `fecha_generada` datetime NOT NULL DEFAULT ((now() - interval 5 hour)),
  `estado` varchar(200) COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'pendiente',
  `stock_al_generar` int NOT NULL,
  `fecha_atendida` datetime DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `fk_alerta_producto` (`id_producto`),
  KEY `fk_alerta_control` (`id_control`),
  KEY `fk_alerta_usuario` (`id_usuario`),
  CONSTRAINT `fk_alerta_control` FOREIGN KEY (`id_control`) REFERENCES `control_inventario` (`id_control`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerta`
--

LOCK TABLES `alerta` WRITE;
/*!40000 ALTER TABLE `alerta` DISABLE KEYS */;
INSERT INTO `alerta` VALUES (1,1,1,'2026-05-16 02:31:23','recibido',4,'2026-05-16 02:34:17',1);
/*!40000 ALTER TABLE `alerta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Pernos Expansivos T','Para las fijaciones',1),(2,'Tornillos Spack','Fijaciones en madera, melamina, etc...',1),(3,'Tornillos Drywall','Todos los tamaños para drywall',1),(4,'Tornillos wafer ','',1),(5,'Stobolts','',1),(6,'Clavos de cemento ','',1),(7,'Cintillos ','',1),(8,'Telescopicas','',1);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `control_inventario`
--

DROP TABLE IF EXISTS `control_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `control_inventario` (
  `id_control` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `tipo_control` varchar(20) COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'unidad',
  `stock_actual` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '0',
  `cantidad_cajones` int DEFAULT '0',
  `cajones_abiertos` int DEFAULT '0',
  `nivel_estado` enum('LLENO','MEDIO','BAJO') COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `fecha_actualizacion` datetime NOT NULL DEFAULT ((now() - interval 5 hour)) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_control`),
  UNIQUE KEY `id_producto` (`id_producto`),
  CONSTRAINT `fk_control_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `control_inventario`
--

LOCK TABLES `control_inventario` WRITE;
/*!40000 ALTER TABLE `control_inventario` DISABLE KEYS */;
INSERT INTO `control_inventario` VALUES (1,1,'caja',12,4,0,0,NULL,'2026-05-16 02:33:42'),(2,2,'caja',10,1,0,0,NULL,'2026-06-01 03:14:42'),(3,3,'caja',5,1,0,0,NULL,'2026-06-01 03:15:45'),(4,4,'caja',10,0,0,0,NULL,'2026-06-01 03:16:15'),(5,5,'unidad',40,10,0,0,NULL,'2026-06-01 03:17:01'),(6,6,'unidad',22,5,0,0,NULL,'2026-06-13 04:41:53'),(7,7,'caja',25,5,0,0,NULL,'2026-06-13 20:06:05'),(8,8,'unidad',22,5,0,0,NULL,'2026-06-13 20:06:23');
/*!40000 ALTER TABLE `control_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento`
--

DROP TABLE IF EXISTS `movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_spanish_ci NOT NULL,
  `cantidad` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT ((now() - interval 5 hour)),
  `observacion` varchar(200) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `stock_resultado` int NOT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_movimiento_producto` (`id_producto`),
  KEY `fk_movimiento_usuario` (`id_usuario`),
  CONSTRAINT `fk_movimiento_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento`
--

LOCK TABLES `movimiento` WRITE;
/*!40000 ALTER TABLE `movimiento` DISABLE KEYS */;
INSERT INTO `movimiento` VALUES (1,1,1,'salida',4,'2026-05-16 02:31:23','777',4),(2,1,1,'salida',2,'2026-05-16 02:32:31','',2),(3,1,1,'entrada',10,'2026-05-16 02:33:42','',12);
/*!40000 ALTER TABLE `movimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `precio_compra` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tipo_control` varchar(20) COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'unidad',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `imagen` varchar(255) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `fk_producto_categoria` (`id_categoria`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,1,'Perno expansivo 3/8 x 3','Ubicado en\n- Marca: Torfix\n- Lo que viene: 150 en la caja\n- UND:1.5\n- DOC:12\n- %:zz\n- Millar:',22.00,43.99,'caja',1,'productos/df77723cb7a54c60bff0aefe90f88283.jpg'),(2,8,'Corredera telescopica 10 Pesada','\n- Marca:\n- Lo que viene:\n- UND:\n- DOC:\n- %:\n- Millar:',3.00,7.00,'caja',1,'productos/946a3ca56e84405c90ffd85db476d592.jpeg'),(3,5,'Stobol 5/32 x 1','\n- Marca:\n- Lo que viene:\n- UND:\n- DOC:\n- %:\n- Millar:',15.00,30.00,'caja',1,'productos/1d520a89642240aca062800cab50b18f.jpg'),(4,4,'Tornillos wafer 8 x 1','\n- Marca:\n- Lo que viene:\n- UND:\n- DOC:\n- %:\n- Millar:',12.00,23.00,'caja',1,NULL),(5,6,'Clavo cemento 3 pulgadas','\n- Marca:\n- Lo que viene:\n- UND:\n- DOC:\n- %:\n- Millar:',4.50,9.00,'unidad',1,NULL);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `rol` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL DEFAULT 'vendedor',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_registro` date NOT NULL DEFAULT (curdate()),
  `acceso_total` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Administrador','admin@ferreteria.com','$2b$12$OtjLemDcm8wP1XoaJXC1Qu2kaKixSY4bJd8PleNbdw/roHyIFURYu','admin',1,'2026-05-14',1),(2,'Jorst Huillca','jorst@ferreteria.com','$2b$12$H9wMzIJpoNvyGreb3muOQ.y8YOUYArfH0QerhvHQl9xibkTfDGmY6','admin',1,'2026-05-14',1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_alertas_pendientes`
--

DROP TABLE IF EXISTS `vista_alertas_pendientes`;
/*!50001 DROP VIEW IF EXISTS `vista_alertas_pendientes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_alertas_pendientes` AS SELECT 
 1 AS `id_alerta`,
 1 AS `producto`,
 1 AS `stock_al_generar`,
 1 AS `stock_minimo`,
 1 AS `fecha_generada`,
 1 AS `estado`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_precios_productos`
--

DROP TABLE IF EXISTS `vista_precios_productos`;
/*!50001 DROP VIEW IF EXISTS `vista_precios_productos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_precios_productos` AS SELECT 
 1 AS `id_producto`,
 1 AS `nombre`,
 1 AS `categoria`,
 1 AS `costo_proveedor`,
 1 AS `precio_venta`,
 1 AS `ganancia_unitaria`,
 1 AS `margen_porcentaje`,
 1 AS `stock_actual`,
 1 AS `stock_minimo`,
 1 AS `nivel_estado`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_alertas_pendientes`
--

/*!50001 DROP VIEW IF EXISTS `vista_alertas_pendientes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_alertas_pendientes` AS select `a`.`id_alerta` AS `id_alerta`,`p`.`nombre` AS `producto`,`a`.`stock_al_generar` AS `stock_al_generar`,`ci`.`stock_minimo` AS `stock_minimo`,`a`.`fecha_generada` AS `fecha_generada`,`a`.`estado` AS `estado` from ((`alerta` `a` join `producto` `p` on((`a`.`id_producto` = `p`.`id_producto`))) join `control_inventario` `ci` on((`a`.`id_control` = `ci`.`id_control`))) where (`a`.`estado` = 'pendiente') order by `a`.`fecha_generada` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_precios_productos`
--

/*!50001 DROP VIEW IF EXISTS `vista_precios_productos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_precios_productos` AS select `p`.`id_producto` AS `id_producto`,`p`.`nombre` AS `nombre`,`c`.`nombre` AS `categoria`,`p`.`precio_compra` AS `costo_proveedor`,`p`.`precio` AS `precio_venta`,(`p`.`precio` - `p`.`precio_compra`) AS `ganancia_unitaria`,round((((`p`.`precio` - `p`.`precio_compra`) / nullif(`p`.`precio_compra`,0)) * 100),2) AS `margen_porcentaje`,`ci`.`stock_actual` AS `stock_actual`,`ci`.`stock_minimo` AS `stock_minimo`,`ci`.`nivel_estado` AS `nivel_estado` from ((`producto` `p` join `categoria` `c` on((`p`.`id_categoria` = `c`.`id_categoria`))) left join `control_inventario` `ci` on((`ci`.`id_producto` = `p`.`id_producto`))) where (`p`.`estado` = true) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13 16:00:23
